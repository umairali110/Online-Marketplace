import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SellerStoreService } from './seller-store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/store')
export class SellerStoreController {
  constructor(private sellerStoreService: SellerStoreService) {}

  @Get()
  getMyStore(@CurrentUser('id') userId: string) {
    return this.sellerStoreService.getMyStore(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateStoreDto) {
    return this.sellerStoreService.createStore(userId, dto);
  }

  @Patch()
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateStoreDto) {
    return this.sellerStoreService.updateStore(userId, dto);
  }
}