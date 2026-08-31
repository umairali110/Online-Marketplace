import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListJobsDto } from './dto/list-jobs.dto';
import { paginate } from 'src/common/dto/pagination.dto';

@Injectable()
export class JobFeedService {
  constructor(private prisma: PrismaService) {}

    async listOpen(query: ListJobsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      status: 'OPEN' as const,
      category: query.categorySlug ? { slug: query.categorySlug } : undefined,
      city: query.city ? { contains: query.city, mode: 'insensitive' as const } : undefined,
    };

    const [jobs, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where,
        include: { category: true, _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.jobPost.count({ where }),
    ]);

    const shaped = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      city: j.city,
      country: j.country,
      budget: j.budget ? Number(j.budget) : null,
      category: { id: j.category.id, name: j.category.name, slug: j.category.slug },
      applicationCount: j._count.applications,
      createdAt: j.createdAt,
    }));
    return paginate(shaped, total, page, limit);
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id }, include: { category: true } });
    if (!job) throw new NotFoundException('Job post not found');
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      city: job.city,
      country: job.country,
      budget: job.budget ? Number(job.budget) : null,
      status: job.status,
      category: { id: job.category.id, name: job.category.name, slug: job.category.slug },
      createdAt: job.createdAt,
    };
  }
}