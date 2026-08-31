import { Controller, Get, UseGuards,Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SellerOrdersService } from './seller-orders.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/orders')
export class SellerOrdersController {
  constructor(private sellerOrdersService: SellerOrdersService) {}

    @Get()
  list(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.sellerOrdersService.list(userId, Number(page) || 1, Number(limit) || 20);
  }
}