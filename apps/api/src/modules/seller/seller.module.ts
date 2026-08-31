import { Module } from '@nestjs/common';
import { SellerStoreController } from './seller-store.controller';
import { SellerStoreService } from './seller-store.service';
import { SellerProductsController } from './seller-products.controller';
import { SellerProductsService } from './seller-products.service';
import { SellerOrdersController } from './seller-orders.controller';
import { SellerOrdersService } from './seller-orders.service';
import { SellerAnalyticsController } from './seller-analytics.controller';
import { SellerAnalyticsService } from './seller-analytics.service';
import { SellerWorkflowsController } from './seller-workflows.controller';
import { SellerWorkflowsService } from './seller-workflows.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    SellerStoreController,
    SellerProductsController,
    SellerOrdersController,
    SellerAnalyticsController,
    SellerWorkflowsController,
  ],
  providers: [
    SellerStoreService,
    SellerProductsService,
    SellerOrdersService,
    SellerAnalyticsService,
    SellerWorkflowsService,
  ],
  exports: [SellerStoreService, SellerWorkflowsService],
})
export class SellerModule {}