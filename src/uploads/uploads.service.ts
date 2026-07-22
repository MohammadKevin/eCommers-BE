import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadsService {
  uploadFile(file: Express.Multer.File, folder = 'e-commers/products'): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) {
      throw new BadRequestException('Berkas foto tidak ditemukan');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Format file harus berupa gambar (JPG, PNG, WEBP, dll)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder = 'e-commers/products') {
    if (!files || files.length === 0) {
      throw new BadRequestException('Berkas foto tidak ditemukan');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);

    return results.map((res: any) => ({
      url: res.secure_url,
      publicId: res.public_id,
    }));
  }
}
