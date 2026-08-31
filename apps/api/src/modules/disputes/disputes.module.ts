import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { RiskModule } from '../risk/risk.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [RiskModule, NotificationsModule],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}