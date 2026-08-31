import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SellerAnalyticsService } from './seller-analytics.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/analytics')
export class SellerAnalyticsController {
  constructor(private sellerAnalyticsService: SellerAnalyticsService) {}

  @Get('overview')
  overview(@CurrentUser('id') userId: string) {
    return this.sellerAnalyticsService.overview(userId);
  }
}