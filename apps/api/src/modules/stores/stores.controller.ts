import { Controller, Get, Param, Post, UseGuards,Body,Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StoresService } from './stores.service';
import { ListLocalStoresDto } from './dto/list-local-stores.dto';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get('top')
  topStores() {
    return this.storesService.topStores();
  }

  @Get('local')
  listLocal(@Query() query: ListLocalStoresDto) {
    return this.storesService.listLocal(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  toggleFollow(@CurrentUser('id') userId: string, @Param('id') storeId: string) {
    return this.storesService.toggleFollow(userId, storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/follow-status')
  followStatus(@CurrentUser('id') userId: string, @Param('id') storeId: string) {
    return this.storesService.isFollowing(userId, storeId);
  }

    @Post(':id/visit')
  logVisit(@Param('id') storeId: string, @Body() body: { source?: string }) {
    return this.storesService.logVisit(storeId, body.source ?? 'direct');
  }

}