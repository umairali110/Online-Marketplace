import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderDirectoryService } from './provider-directory.service';

@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProviderDirectoryController {
  constructor(private service: ProviderDirectoryService) {}

  @Get('by-category/:slug')
  listByCategory(@Param('slug') slug: string) {
    return this.service.listByCategory(slug);
  }

  @Get(':id/public')
  findPublicProfile(@Param('id') id: string) {
    return this.service.findPublicProfile(id);
  }
}