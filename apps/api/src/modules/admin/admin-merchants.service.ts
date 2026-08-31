import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';

@Injectable()
export class AdminMerchantsService {
  constructor(private prisma: PrismaService) {}

    async list(page = 1, limit = 20) {
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        include: { seller: { select: { name: true, email: true } }, _count: { select: { listings: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.store.count(),
    ]);
    const shaped = stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      sellerName: s.seller.name,
      sellerEmail: s.seller.email,
      status: s.status,
      productCount: s._count.listings,
      joinedAt: s.createdAt,
    }));
    return paginate(shaped, total, page, limit);
  }

  async approve(storeId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.store.update({ where: { id: storeId }, data: { status: 'ACTIVE' } });
  }

  async suspend(storeId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.store.update({ where: { id: storeId }, data: { status: 'SUSPENDED' } });
  }
}