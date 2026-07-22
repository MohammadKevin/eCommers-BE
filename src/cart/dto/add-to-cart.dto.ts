import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'variant-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Variant ID wajib diisi' })
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Jumlah barang harus berupa angka' })
  @Min(1, { message: 'Jumlah barang minimal 1' })
  quantity: number;
}
