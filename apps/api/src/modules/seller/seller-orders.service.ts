import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SellerStoreService } from './seller-store.service';
import { paginate } from 'src/common/dto/pagination.dto';

@Injectable()
export class SellerOrdersService {
  constructor(
    private prisma: PrismaService,
    private sellerStoreService: SellerStoreService,
  ) {}

    async list(userId: string, page = 1, limit = 20) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const [subOrders, total] = await Promise.all([
      this.prisma.subOrder.findMany({
        where: { storeId: store.id },
        include: {
          order: { include: { user: { select: { name: true, email: true } }, address: true } },
          items: { include: { storeListing: { include: { product: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subOrder.count({ where: { storeId: store.id } }),
    ]);

    const shaped = subOrders.map((so) => ({
      id: so.id,
      orderId: so.orderId,
      customerName: so.order.user.name,
      customerEmail: so.order.user.email,
      city: so.order.address.city,
      trackingStatus: so.trackingStatus,
      codCollected: so.codCollected,
      createdAt: so.createdAt,
      items: so.items.map((it) => ({ title: it.storeListing.product.title, qty: it.qty, price: Number(it.price) })),
      total: so.items.reduce((sum, it) => sum + Number(it.price) * it.qty, 0),
    }));
    return paginate(shaped, total, page, limit);
  }
}