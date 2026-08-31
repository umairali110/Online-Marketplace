import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const ALLOWED_FOLDERS = ['avatars', 'products', 'stores'] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

const imageUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(), // buffer only — never touches local disk, safe on any host
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Only jpg, png, webp images are allowed'), false);
    }
    cb(null, true);
  },
});

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(imageUploadInterceptor)
  async upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    const safeFolder: Folder = ALLOWED_FOLDERS.includes(folder as Folder) ? (folder as Folder) : 'products';
    return this.uploadsService.uploadImage(file, safeFolder);
  }
}