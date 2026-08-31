import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { TrackingGateway } from './tracking.gateway';

interface AdvanceJobData {
  orderId: string;
  subOrderId: string;
  targetStatus: 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}

@Processor('tracking')
export class TrackingProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private gateway: TrackingGateway,
  ) {
    super();
  }

  async process(job: Job<AdvanceJobData>) {
    const { orderId, subOrderId, targetStatus } = job.data;

    await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        trackingStatus: targetStatus,
        // COD is collected only once the order is actually delivered.
        ...(targetStatus === 'DELIVERED' ? { codCollected: true } : {}),
      },
    });

    this.gateway.emitTrackingUpdate(orderId, subOrderId, targetStatus);
  }
}