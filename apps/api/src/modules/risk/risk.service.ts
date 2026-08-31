import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const SPIKE_MULTIPLIER = 3; // flag if order total > 3x the customer's average order
const FIRST_ORDER_THRESHOLD = 1000; // flag a large first-ever order
const DISPUTE_COUNT_MEDIUM = 2;
const DISPUTE_COUNT_HIGH = 4;

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  // Called right after an order is placed — rule-based, no ML (MVP scope per design.md).
  async evaluateOrder(orderId: string, userId: string, total: number, country: string) {
    const priorOrders = await this.prisma.order.findMany({
      where: { userId, id: { not: orderId } },
      select: { total: true },
    });

    if (priorOrders.length === 0) {
      if (total > FIRST_ORDER_THRESHOLD) {
        await this.prisma.riskFlag.create({
          data: {
            level: 'LOW',
            reason: `Large first-ever order ($${total.toFixed(0)}) from a new account`,
            country,
            orderId,
            userId,
          },
        });
      }
      return;
    }

    const avg = priorOrders.reduce((s, o) => s + Number(o.total), 0) / priorOrders.length;
    if (avg > 0 && total > avg * SPIKE_MULTIPLIER) {
      await this.prisma.riskFlag.create({
        data: {
          level: 'MEDIUM',
          reason: `Order value ($${total.toFixed(0)}) is ${(total / avg).toFixed(1)}x this customer's average`,
          country,
          orderId,
          userId,
        },
      });
    }
  }

  // Called right after a dispute is raised.
  async evaluateDispute(userId: string, country: string | null) {
    const disputeCount = await this.prisma.dispute.count({ where: { raisedByUserId: userId } });

    if (disputeCount >= DISPUTE_COUNT_HIGH) {
      await this.prisma.riskFlag.create({
        data: {
          level: 'HIGH',
          reason: `Customer has raised ${disputeCount} disputes`,
          country: country ?? undefined,
          userId,
        },
      });
    } else if (disputeCount >= DISPUTE_COUNT_MEDIUM) {
      await this.prisma.riskFlag.create({
        data: {
          level: 'MEDIUM',
          reason: `Customer has raised ${disputeCount} disputes`,
          country: country ?? undefined,
          userId,
        },
      });
    }
  }
}