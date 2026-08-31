import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadsService } from '../uploads/uploads.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

const avatarUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Only jpg, png, webp images are allowed'), false);
    }
    cb(null, true);
  },
});

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadsService: UploadsService,
  ) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch()
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(avatarUploadInterceptor)
  async uploadAvatar(@CurrentUser('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    const { url } = await this.uploadsService.uploadImage(file, 'avatars');
    return this.usersService.updateAvatar(userId, url);
  }

    @Get('notification-preferences')
  getPrefs(@CurrentUser('id') userId: string) {
    return this.usersService.getNotificationPreferences(userId);
  }

  @Patch('notification-preferences')
  updatePrefs(@CurrentUser('id') userId: string, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.usersService.updateNotificationPreferences(userId, dto as Record<string, boolean>);
  }
}