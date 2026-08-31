import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards,Delete } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DisputeStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminMerchantsService } from './admin-merchants.service';
import { AdminDisputesService } from './admin-disputes.service';
import { AdminCommissionsService } from './admin-commissions.service';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { AdminRiskService } from './admin-risk.service';
import { AdminProvidersService } from './admin-providers.service';
import { AdminServiceCategoriesService } from './admin-service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { AdminServiceCommissionsService } from './admin-service-commissions.service';
import { AuditLogService } from './audit-log-service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private dashboardService: AdminDashboardService,
    private merchantsService: AdminMerchantsService,
    private disputesService: AdminDisputesService,
    private commissionsService: AdminCommissionsService,
    private riskService: AdminRiskService,
    private providersService: AdminProvidersService,
    private serviceCategoriesService: AdminServiceCategoriesService,
    private serviceCommissionsService: AdminServiceCommissionsService,
    private auditLogService: AuditLogService,
  ) {}

  @Get('dashboard/overview')
  dashboardOverview() {
    return this.dashboardService.overview();
  }

    @Get('merchants')
  listMerchants(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.merchantsService.list(Number(page) || 1, Number(limit) || 20);
  }

  @Post('merchants/:id/approve')
  async approveMerchant(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    const result = await this.merchantsService.approve(id);
    await this.auditLogService.log(adminId, 'MERCHANT_APPROVED', 'Store', id);
    return result;
  }

  @Post('merchants/:id/suspend')
  async suspendMerchant(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    const result = await this.merchantsService.suspend(id);
    await this.auditLogService.log(adminId, 'MERCHANT_SUSPENDED', 'Store', id);
    return result;
  }

   @Get('disputes')
  listDisputes(@Query('status') status?: DisputeStatus, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.disputesService.list(status, Number(page) || 1, Number(limit) || 20);
  }

  @Patch('disputes/:id/status')
  async updateDisputeStatus(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: UpdateDisputeStatusDto) {
    const result = await this.disputesService.updateStatus(id, dto.status);
    await this.auditLogService.log(adminId, `DISPUTE_${dto.status}`, 'Dispute', id);
    return result;
  }

  @Get('commissions/overview')
  commissionsOverview() {
    return this.commissionsService.overview();
  }

  @Post('commissions/:storeId/settle')
  async settleCommission(@CurrentUser('id') adminId: string, @Param('storeId') storeId: string) {
    const result = await this.commissionsService.settleForStore(storeId);
    await this.auditLogService.log(adminId, 'COMMISSION_SETTLED', 'Store', storeId);
    return result;
  }

    @Get('risk/overview')
  riskOverview() {
    return this.riskService.overview();
  }

    @Get('providers')
  listProviders() {
    return this.providersService.list();
  }

  @Post('providers/:id/verify')
  async verifyProvider(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    const result = await this.providersService.setVerified(id, true);
    await this.auditLogService.log(adminId, 'PROVIDER_VERIFIED', 'Provider', id);
    return result;
  }

  @Post('providers/:id/unverify')
  async unverifyProvider(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    const result = await this.providersService.setVerified(id, false);
    await this.auditLogService.log(adminId, 'PROVIDER_UNVERIFIED', 'Provider', id);
    return result;
  }

   @Post('service-categories')
  async createServiceCategory(@CurrentUser('id') adminId: string, @Body() dto: CreateServiceCategoryDto) {
    const result = await this.serviceCategoriesService.create(dto);
    await this.auditLogService.log(adminId, 'SERVICE_CATEGORY_CREATED', 'ServiceCategory', result.id);
    return result;
  }

  @Delete('service-categories/:id')
  async deleteServiceCategory(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    const result = await this.serviceCategoriesService.remove(id);
    await this.auditLogService.log(adminId, 'SERVICE_CATEGORY_DELETED', 'ServiceCategory', id);
    return result;
  }

    @Get('service-commissions/overview')
  serviceCommissionsOverview() {
    return this.serviceCommissionsService.overview();
  }

  @Post('service-commissions/:providerId/settle')
  async settleServiceCommission(@CurrentUser('id') adminId: string, @Param('providerId') providerId: string) {
    const result = await this.serviceCommissionsService.settleForProvider(providerId);
    await this.auditLogService.log(adminId, 'SERVICE_COMMISSION_SETTLED', 'Provider', providerId);
    return result;
  }

  @Get('audit-log')
  listAuditLog() {
    return this.auditLogService.list();
  }
}