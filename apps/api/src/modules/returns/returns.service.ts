import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReturnDto } from './dto/create-return.dto';

const RETURN_WINDOW_DAYS = 7;

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateReturnDto) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: dto.subOrderId },
      include: { order: true, store: true },
    });
    if (!subOrder) throw new NotFoundException('Order not found');
    if (subOrder.order.userId !== userId) throw new ForbiddenException();
    if (subOrder.trackingStatus !== 'DELIVERED') {
      throw new BadRequestException('Returns can only be requested after delivery');
    }

    const daysSinceDelivery = (Date.now() - subOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new BadRequestException(`The ${RETURN_WINDOW_DAYS}-day return window has passed for this order`);
    }

    const existing = await this.prisma.returnRequest.findFirst({ where: { subOrderId: dto.subOrderId } });
    if (existing) throw new BadRequestException('A return has already been requested for this order');

    const returnRequest = await this.prisma.returnRequest.create({
      data: { subOrderId: dto.subOrderId, userId, reason: dto.reason, images: dto.images ?? [] },
    });

    await this.notificationsService.create(
      subOrder.store.sellerId,
      'DISPUTE_UPDATE',
      'Return requested',
      `A customer requested a return for an order from ${subOrder.store.name}.`,
    );

    return returnRequest;
  }

  async listMine(userId: string) {
    return this.prisma.returnRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

    async listForSeller(sellerId: string) {
    const stores = await this.prisma.store.findMany({ where: { sellerId }, select: { id: true } });
    const storeIds = stores.map((s) => s.id);

    const returns = await this.prisma.returnRequest.findMany({
      where: { subOrder: { storeId: { in: storeIds } } },
      include: { subOrder: { include: { items: { include: { storeListing: { include: { product: true } } } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return returns.map((r) => ({
      id: r.id,
      reason: r.reason,
      images: r.images,
      status: r.status,
      createdAt: r.createdAt,
      items: r.subOrder.items.map((it: { storeListing: { product: { title: string } } }) => it.storeListing.product.title),
    }));
  }

  async updateStatus(sellerId: string, id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { subOrder: { include: { store: true } } },
    });
    if (!returnRequest) throw new NotFoundException('Return request not found');
    if (returnRequest.subOrder.store.sellerId !== sellerId) throw new ForbiddenException();

    const updated = await this.prisma.returnRequest.update({ where: { id }, data: { status } });

    await this.notificationsService.create(
      returnRequest.userId,
      'DISPUTE_UPDATE',
      'Return request update',
      `Your return request status changed to ${status}.`,
    );

    return updated;
  }
}