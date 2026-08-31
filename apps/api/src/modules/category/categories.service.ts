import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from 'src/common/cache/cache.service';
@Injectable()
export class CategoriesService {
    constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll() {
    const cached = await this.cache.get('categories:all');
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
    await this.cache.set('categories:all', categories, 300); // 5 min TTL — near-static data
    return categories;
  }
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}