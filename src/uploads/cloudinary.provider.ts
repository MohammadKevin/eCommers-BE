import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'dii1mybyz',
      api_key: configService.get<string>('CLOUDINARY_API_KEY') || '827182263461469',
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET') || 'onNYmsxWjEl6_LJrGNkyKgQWN0k',
    });
  },
};
