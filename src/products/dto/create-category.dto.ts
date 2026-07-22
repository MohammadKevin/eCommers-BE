import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Pakaian Pria' })
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  name: string;

  @ApiProperty({ example: 'pakaian-pria' })
  @IsString()
  @IsNotEmpty({ message: 'Slug kategori wajib diisi' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-)' })
  slug: string;

  @ApiPropertyOptional({ example: 'category-parent-uuid-here' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
