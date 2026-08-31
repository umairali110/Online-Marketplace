import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDirectHireDto } from './dto/create-direct-hire.dto';
const COMMISSION_RATE = Number(process.env.COMMISSION_RATE ?? '0.1');

@Injectable()
export class DirectHireService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async hire(clientId: string, dto: CreateDirectHireDto) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: dto.providerId },
      include: { categories: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    if (!provider.city || !provider.country) {
      throw new BadRequestException("This provider's location isn't set yet");
    }

    const category = dto.categorySlug
      ? await this.prisma.serviceCategory.findUnique({ where: { slug: dto.categorySlug } })
      : provider.categories[0];
    if (!category) throw new BadRequestException('No valid category for this hire');

    // Direct hire skips the OPEN bidding stage entirely — job is created already
    // ASSIGNED to this provider, with a matching ACCEPTED application for a
    // consistent audit trail (same shape other flows expect).
    const job = await this.prisma.$transaction(async (tx) => {
      const createdJob = await tx.jobPost.create({
        data: {
          clientId,
          title: dto.title,
          description: dto.description,
          categoryId: category.id,
          city: provider.city!,
          country: provider.country!,
          budget: dto.budget,
          status: 'ASSIGNED',
        },
        include: { category: true },
      });

            await tx.jobApplication.create({
        data: {
          jobPostId: createdJob.id,
          providerId: provider.id,
          message: 'Direct hire request',
          status: 'ACCEPTED',
        },
      });

      if (dto.budget) {
        await tx.serviceCommission.create({
          data: {
            providerId: provider.id,
            jobPostId: createdJob.id,
            amount: dto.budget * COMMISSION_RATE,
          },
        });
      }

      return createdJob;

    });

    await this.notificationsService.create(
      provider.userId,
      'JOB_STATUS_UPDATE',
      'You were hired directly!',
      `A client hired you directly for "${job.title}".`,
    );

    return {
      id: job.id,
      title: job.title,
      status: job.status,
      city: job.city,
      country: job.country,
      budget: job.budget ? Number(job.budget) : null,
      category: { id: job.category.id, name: job.category.name, slug: job.category.slug },
      createdAt: job.createdAt,
    };
  }
}