import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProviderProfileService } from './provider-profile.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { ExtractVoiceDto } from './dto/extract-voice.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROVIDER)
@Controller('provider/profile')
export class ProviderProfileController {
  constructor(private providerProfileService: ProviderProfileService) {}

  @Get()
  getMine(@CurrentUser('id') userId: string) {
    return this.providerProfileService.getMine(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProviderProfileDto) {
    return this.providerProfileService.create(userId, dto);
  }

  @Post('extract-voice')
  extractVoice(@Body() dto: ExtractVoiceDto) {
    return this.providerProfileService.extractFromVoice(dto.transcript);
  }
}