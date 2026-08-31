import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';

const STAGES = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;
const STEP_MS = Number(process.env.TRACKING_STEP_SECONDS ?? '20') * 1000;

@Injectable()
export class TrackingService {
  constructor(
    @InjectQueue('tracking') private trackingQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // Called right after checkout — schedules the remaining 4 status transitions
  // for every sub-order in the order (each store ships independently).
  async scheduleForOrder(orderId: string) {
    const subOrders = await this.prisma.subOrder.findMany({ where: { orderId } });

    for (const subOrder of subOrders) {
      for (let i = 1; i < STAGES.length; i++) {
        await this.trackingQueue.add(
          'advance',
          { orderId, subOrderId: subOrder.id, targetStatus: STAGES[i] },
          { delay: STEP_MS * i },
        );
      }
    }
  }
}