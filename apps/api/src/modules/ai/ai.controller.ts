import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { EmployeeReplyDto } from './dto/employee-reply.dto';
import { SellerStoreService } from '../seller/seller-store.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private sellerStoreService: SellerStoreService,
  ) {}

  @Post('store-description')
  async generateDescription(@Body() body: { name: string; category?: string }) {
    const description = await this.aiService.generateStoreDescription(body.name, body.category);
    return { description };
  }

  @Post('employee-reply')
  async employeeReply(@CurrentUser('id') userId: string, @Body() dto: EmployeeReplyDto) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const reply = await this.aiService.employeeReply(store.id, dto.message);
    return { reply };
  }
}