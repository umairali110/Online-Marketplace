import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadsService {
  private logger = new Logger(UploadsService.name);

  uploadImage(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    if (!file) throw new BadRequestException('No file provided');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `online-marketplace/${folder}`,
          resource_type: 'image',
          // auto quality/format = Cloudinary serves the smallest correct file per
          // device (webp/avif where supported) without us managing variants manually.
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message}`);
            return reject(new BadRequestException('Image upload failed'));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      this.logger.warn(`Could not delete Cloudinary asset ${publicId}: ${err}`);
    }
  }
}