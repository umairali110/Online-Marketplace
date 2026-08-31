import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SellerProductsService } from './seller-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/products')
export class SellerProductsController {
  constructor(private sellerProductsService: SellerProductsService) {}

    @Get()
  list(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.sellerProductsService.list(userId, Number(page) || 1, Number(limit) || 20);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.sellerProductsService.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.sellerProductsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.sellerProductsService.remove(userId, id);
  }
}