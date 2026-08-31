import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Roles(Role.CUSTOMER)
  @Post('returns')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(userId, dto);
  }

  @Roles(Role.CUSTOMER)
  @Get('returns/mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.returnsService.listMine(userId);
  }

  @Roles(Role.SELLER)
  @Get('seller/returns')
  listForSeller(@CurrentUser('id') userId: string) {
    return this.returnsService.listForSeller(userId);
  }

  @Roles(Role.SELLER)
  @Patch('seller/returns/:id/status')
  updateStatus(@CurrentUser('id') userId: string, @Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED' | 'COMPLETED') {
    return this.returnsService.updateStatus(userId, id, status);
  }
}