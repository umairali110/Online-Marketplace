import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class ServiceCategoriesService {
    constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll() {
    const cached = await this.cache.get('service-categories:all');
    if (cached) return cached;

    const categories = await this.prisma.serviceCategory.findMany({ orderBy: { name: 'asc' } });
    await this.cache.set('service-categories:all', categories, 300);
    return categories;
  }
}