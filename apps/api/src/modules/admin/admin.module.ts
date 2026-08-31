import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminMerchantsService } from './admin-merchants.service';
import { AdminDisputesService } from './admin-disputes.service';
import { AdminCommissionsService } from './admin-commissions.service';
import { AdminRiskService } from './admin-risk.service';
import { AdminProvidersService } from './admin-providers.service';
import { AdminServiceCategoriesService } from './admin-service-categories.service';
import { AdminServiceCommissionsService } from './admin-service-commissions.service';
import { AuditLogService } from './audit-log-service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminDashboardService,
    AdminMerchantsService,
    AdminDisputesService,
    AdminCommissionsService,
    AdminRiskService,
    AdminProvidersService,
    AdminServiceCategoriesService,
    AdminServiceCommissionsService,
    AuditLogService,
  ],
})
export class AdminModule {}