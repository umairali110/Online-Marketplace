import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NearbyProvidersService } from './nearby-providers.service';
import { ListNearbyProvidersDto } from './dto/list-nearby-providers.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('providers/nearby')
export class NearbyProvidersController {
  constructor(private nearbyProvidersService: NearbyProvidersService) {}

  @Get()
  list(@Query() query: ListNearbyProvidersDto) {
    return this.nearbyProvidersService.list(query);
  }
}