import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';
import { TrackingProcessor } from './tracking.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'tracking' })],
  providers: [TrackingGateway, TrackingService, TrackingProcessor],
  exports: [TrackingService],
})
export class TrackingModule {}