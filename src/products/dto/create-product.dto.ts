import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { CreateVariantDto } from './create-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'store-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Store ID wajib diisi' })
  storeId: string;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Category ID wajib diisi' })
  categoryId: string;

  @ApiProperty({ example: 'Kemeja Flanel Premium Pria' })
  @IsString()
  @IsNotEmpty({ message: 'Nama produk wajib diisi' })
  name: string;

  @ApiProperty({ example: 'kemeja-flanel-premium-pria' })
  @IsString()
  @IsNotEmpty({ message: 'Slug produk wajib diisi' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-)' })
  slug: string;

  @ApiProperty({ example: 'Kemeja flanel bahan cotton premium adem dan nyaman dipakai.' })
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi produk wajib diisi' })
  description: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Produk harus memiliki minimal 1 varian' })
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
