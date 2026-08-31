import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PushService } from './push.service';

@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Get('vapid-public-key')
  getKey() {
    return { key: process.env.VAPID_PUBLIC_KEY ?? null };
  }

  @Post('subscribe')
  subscribe(@CurrentUser('id') userId: string, @Body() body: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.pushService.subscribe(userId, body);
  }

  @Post('unsubscribe')
  unsubscribe(@Body('endpoint') endpoint: string) {
    return this.pushService.unsubscribe(endpoint);
  }
}