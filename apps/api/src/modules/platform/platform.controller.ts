import { Controller, Get } from '@nestjs/common';
import { PlatformService } from './platform.service';

// Deliberately unauthenticated — homepage stats are public marketing data.
@Controller('platform')
export class PlatformController {
  constructor(private platformService: PlatformService) {}

  @Get('stats')
  stats() {
    return this.platformService.stats();
  }
}