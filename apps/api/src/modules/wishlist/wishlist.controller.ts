import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.wishlistService.list(userId);
  }

  @Get('ids')
  listIds(@CurrentUser('id') userId: string) {
    return this.wishlistService.listIds(userId);
  }

  @Post(':storeListingId')
  toggle(@CurrentUser('id') userId: string, @Param('storeListingId') storeListingId: string) {
    return this.wishlistService.toggle(userId, storeListingId);
  }
}