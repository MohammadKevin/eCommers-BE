import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'product-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID wajib diisi' })
  productId: string;

  @ApiProperty({ example: 5 })
  @IsInt({ message: 'Rating harus berupa angka 1 sampai 5' })
  @Min(1, { message: 'Rating minimal 1' })
  @Max(5, { message: 'Rating maksimal 5' })
  rating: number;

  @ApiPropertyOptional({ example: 'Produk sangat bagus, bahan berkualitas tinggi!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
