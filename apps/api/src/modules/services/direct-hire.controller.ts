import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DirectHireService } from './direct-hire.service';
import { CreateDirectHireDto } from './dto/create-direct-hire.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('jobs/direct-hire')
export class DirectHireController {
  constructor(private directHireService: DirectHireService) {}

  @Post()
  hire(@CurrentUser('id') userId: string, @Body() dto: CreateDirectHireDto) {
    return this.directHireService.hire(userId, dto);
  }
}