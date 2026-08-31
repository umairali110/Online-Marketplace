import { Injectable, NotFoundException } from '@nestjs/common';
import { DisputeStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';

@Injectable()
export class AdminDisputesService {
  constructor(private prisma: PrismaService) {}

    async list(status?: DisputeStatus, page = 1, limit = 20) {
    const where = status ? { status } : undefined;
    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        include: { order: { select: { id: true, total: true } }, raisedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dispute.count({ where }),
    ]);
    const shaped = disputes.map((d) => ({
      id: d.id,
      orderId: d.order.id,
      orderTotal: Number(d.order.total),
      customerName: d.raisedBy.name,
      customerEmail: d.raisedBy.email,
      reason: d.reason,
      status: d.status,
      createdAt: d.createdAt,
    }));
    return paginate(shaped, total, page, limit);
  }

  async updateStatus(id: string, status: DisputeStatus) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return this.prisma.dispute.update({ where: { id }, data: { status } });
  }
}