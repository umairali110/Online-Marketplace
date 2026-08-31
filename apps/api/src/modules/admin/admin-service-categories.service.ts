import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { slugify } from 'src/common/utlis/slugify';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { CacheService } from 'src/common/cache/cache.service';
@Injectable()
export class AdminServiceCategoriesService {
  constructor(private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async create(dto: CreateServiceCategoryDto) {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.serviceCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    await this.cache.del('service-categories:all');
    return this.prisma.serviceCategory.create({ data: { name: dto.name, icon: dto.icon, slug } });
  }

  async remove(id: string) {
    const category = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const [jobCount, gigCount] = await Promise.all([
      this.prisma.jobPost.count({ where: { categoryId: id } }),
      this.prisma.gig.count({ where: { categoryId: id } }),
    ]);
    if (jobCount > 0 || gigCount > 0) {
      throw new BadRequestException('Cannot delete a category that has jobs or gigs using it');
    }
    await this.cache.del('service-categories:all');
    await this.prisma.serviceCategory.delete({ where: { id } });
    return { message: 'Category deleted' };
  }
}