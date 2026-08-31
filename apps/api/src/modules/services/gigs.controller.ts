import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GigsService } from './gigs.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class GigsController {
  constructor(private gigsService: GigsService) {}

  @Roles(Role.PROVIDER)
  @Post('provider/gigs')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGigDto) {
    return this.gigsService.create(userId, dto);
  }

  @Roles(Role.PROVIDER)
  @Get('provider/gigs/mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.gigsService.listMine(userId);
  }

  @Roles(Role.PROVIDER)
  @Patch('provider/gigs/:id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateGigDto) {
    return this.gigsService.update(userId, id, dto);
  }

  @Roles(Role.PROVIDER)
  @Delete('provider/gigs/:id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.gigsService.remove(userId, id);
  }

  // Public/customer browse — any authenticated role can view.
  @Roles(Role.CUSTOMER, Role.PROVIDER, Role.SELLER, Role.ADMIN)
  @Get('gigs/by-category/:slug')
  listByCategory(@Param('slug') slug: string) {
    return this.gigsService.listByCategory(slug);
  }

  @Roles(Role.CUSTOMER, Role.PROVIDER, Role.SELLER, Role.ADMIN)
  @Get('gigs/:id')
  findOne(@Param('id') id: string) {
    return this.gigsService.findOne(id);
  }

  @Roles(Role.CUSTOMER)
  @Post('gigs/:id/hire')
  hire(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.gigsService.hireFromGig(userId, id);
  }
}