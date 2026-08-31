import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
const COMMISSION_RATE = Number(process.env.COMMISSION_RATE ?? '0.1');

@Injectable()
export class JobApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async apply(userId: string, jobPostId: string, dto: CreateJobApplicationDto) {
    const providerProfile = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!providerProfile) throw new BadRequestException('Create your provider profile first');

    const job = await this.prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!job) throw new NotFoundException('Job post not found');
    if (job.status !== 'OPEN') throw new BadRequestException('This job is no longer accepting applications');

    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobPostId_providerId: { jobPostId, providerId: providerProfile.id } },
    });
    if (existing) throw new BadRequestException('You already applied to this job');

    const application = await this.prisma.jobApplication.create({
      data: { jobPostId, providerId: providerProfile.id, message: dto.message },
    });

    await this.notificationsService.create(
      job.clientId,
      'JOB_APPLICATION',
      'New application received',
      `A provider applied to your job "${job.title}".`,
    );

    return application;
  }

  async listMine(userId: string) {
    const providerProfile = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!providerProfile) return [];

    const applications = await this.prisma.jobApplication.findMany({
      where: { providerId: providerProfile.id },
      include: { jobPost: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      id: a.id,
      status: a.status,
      message: a.message,
      createdAt: a.createdAt,
      job: {
        id: a.jobPost.id,
        title: a.jobPost.title,
        status: a.jobPost.status,
        city: a.jobPost.city,
        budget: a.jobPost.budget ? Number(a.jobPost.budget) : null,
        category: a.jobPost.category.name,
      },
    }));
  }

  async updateStatus(clientUserId: string, applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { jobPost: true, provider: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.jobPost.clientId !== clientUserId) throw new ForbiddenException();
    if (application.jobPost.status !== 'OPEN') {
      throw new BadRequestException('This job has already been assigned or closed');
    }

        if (status === 'ACCEPTED') {
      await this.prisma.$transaction([
        this.prisma.jobApplication.update({ where: { id: applicationId }, data: { status: 'ACCEPTED' } }),
        this.prisma.jobApplication.updateMany({
          where: { jobPostId: application.jobPostId, id: { not: applicationId }, status: 'PENDING' },
          data: { status: 'REJECTED' },
        }),
        this.prisma.jobPost.update({ where: { id: application.jobPostId }, data: { status: 'ASSIGNED' } }),
      ]);

      // Services vertical revenue: same commission model as product orders, just
      // scoped to job budget instead of order subtotal. Skipped if no budget was set.
      if (application.jobPost.budget) {
        await this.prisma.serviceCommission.upsert({
          where: { jobPostId: application.jobPostId },
          update: {},
          create: {
            providerId: application.providerId,
            jobPostId: application.jobPostId,
            amount: Number(application.jobPost.budget) * COMMISSION_RATE,
          },
        });
      }

      await this.notificationsService.create(
        application.provider.userId,
        'JOB_STATUS_UPDATE',
        'Application update',
        `Your application for "${application.jobPost.title}" was not selected.`,
      );
    }

    return { message: 'Application updated' };
  }
}