import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { slugify } from 'src/common/utlis/slugify';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class SellerStoreService {
  constructor(private prisma: PrismaService) {}

  getMyStore(userId: string) {
    return this.prisma.store.findFirst({ where: { sellerId: userId } });
  }

  async getMyStoreOrThrow(userId: string) {
    const store = await this.getMyStore(userId);
    if (!store) throw new NotFoundException('Create your store first');
    return store;
  }

    async createStore(userId: string, dto: CreateStoreDto) {
    const existing = await this.getMyStore(userId);
    if (existing) throw new BadRequestException('You already have a store');

    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    return this.prisma.store.create({
      data: {
        sellerId: userId,
        name: dto.name,
        slug,
        category: dto.category,
        description: dto.description,
        logo: dto.logo,
        banner: dto.banner,
        city: dto.city,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'PENDING',
      },
    });
  }

  async updateStore(userId: string, dto: UpdateStoreDto) {
    const store = await this.getMyStoreOrThrow(userId);
    return this.prisma.store.update({ where: { id: store.id }, data: dto });
  }
}