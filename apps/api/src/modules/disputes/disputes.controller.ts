import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(userId, dto);
  }

  @Get('mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.disputesService.listMine(userId);
  }
}