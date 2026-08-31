import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AddressesModule } from '../addresses/addresses.module';
import { TrackingModule } from '../tracking/tracking.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SellerModule } from '../seller/seller.module';
import { RiskModule } from '../risk/risk.module';
import { AuthModule } from '../auth/auth.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [AddressesModule, TrackingModule, NotificationsModule, SellerModule, RiskModule, AuthModule,CouponsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}