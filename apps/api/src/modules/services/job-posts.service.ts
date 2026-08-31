import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';

function shapeJobPost(job: any) {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    city: job.city,
    country: job.country,
    budget: job.budget ? Number(job.budget) : null,
    status: job.status,
    category: job.category ? { id: job.category.id, name: job.category.name, slug: job.category.slug } : undefined,
    applicationCount: job._count?.applications ?? job.applications?.length ?? 0,
    createdAt: job.createdAt,
  };
}

@Injectable()
export class JobPostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateJobPostDto) {
    const category = await this.prisma.serviceCategory.findUnique({ where: { slug: dto.categorySlug } });
    if (!category) throw new BadRequestException('Invalid category');

    const job = await this.prisma.jobPost.create({
      data: {
        clientId: userId,
        title: dto.title,
        description: dto.description,
        categoryId: category.id,
        city: dto.city,
        country: dto.country,
        budget: dto.budget,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      include: { category: true },
    });
    return shapeJobPost(job);
  }

  async listMine(userId: string) {
    const jobs = await this.prisma.jobPost.findMany({
      where: { clientId: userId },
      include: { category: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(shapeJobPost);
  }

  async findOneForOwner(userId: string, id: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id },
      include: {
        category: true,
        applications: {
          include: { provider: { include: { categories: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!job) throw new NotFoundException('Job post not found');
    if (job.clientId !== userId) throw new ForbiddenException();

    const applications = await Promise.all(
      job.applications.map(async (a) => {
        const providerUser = await this.prisma.user.findUnique({
          where: { id: a.provider.userId },
          select: { name: true, avatar: true },
        });
        return {
          id: a.id,
          message: a.message,
          status: a.status,
          createdAt: a.createdAt,
          provider: {
            id: a.provider.id,
            name: providerUser?.name ?? 'Provider',
            avatar: providerUser?.avatar ?? null,
            bio: a.provider.bio,
            skills: a.provider.skills,
            ratingAvg: a.provider.ratingAvg,
            ratingCount: a.provider.ratingCount,
            city: a.provider.city,
          },
        };
      }),
    );

    return { ...shapeJobPost(job), applications };
  }

  async updateStatus(userId: string, id: string, status: 'COMPLETED' | 'CANCELLED') {
    const job = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job post not found');
    if (job.clientId !== userId) throw new ForbiddenException();

    return this.prisma.jobPost.update({ where: { id }, data: { status } });
  }
}