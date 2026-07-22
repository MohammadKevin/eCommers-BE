import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'SKU-SHIRT-RED-XL' })
  @IsString()
  @IsNotEmpty({ message: 'SKU wajib diisi' })
  sku: string;

  @ApiProperty({ example: 'Merah - XL' })
  @IsString()
  @IsNotEmpty({ message: 'Nama varian wajib diisi' })
  name: string;

  @ApiProperty({ example: 150000 })
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @Min(0, { message: 'Harga tidak boleh kurang dari 0' })
  price: number;

  @ApiPropertyOptional({ example: 135000 })
  @IsOptional()
  @IsNumber({}, { message: 'Harga grosir harus berupa angka' })
  @Min(0)
  wholesalePrice?: number;

  @ApiProperty({ example: 50 })
  @IsInt({ message: 'Stok harus berupa bilangan bulat' })
  @Min(0, { message: 'Stok tidak boleh kurang dari 0' })
  stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/variant-red.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
