import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'variant-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Variant ID wajib diisi' })
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
