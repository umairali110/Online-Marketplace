import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskService } from '../risk/risk.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private riskService: RiskService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId }, include: { address: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();

    const dispute = await this.prisma.dispute.create({
      data: { orderId: dto.orderId, raisedByUserId: userId, reason: dto.reason },
    });

    await this.riskService.evaluateDispute(userId, order.address.country);

    return dispute;
  }

  async listMine(userId: string) {
    return this.prisma.dispute.findMany({ where: { raisedByUserId: userId }, orderBy: { createdAt: 'desc' } });
  }
}