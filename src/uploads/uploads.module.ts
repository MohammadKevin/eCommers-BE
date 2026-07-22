import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [CloudinaryProvider, UploadsService],
  exports: [CloudinaryProvider, UploadsService],
})
export class UploadsModule {}
