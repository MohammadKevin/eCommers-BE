import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Jumlah barang harus berupa angka' })
  @Min(1, { message: 'Jumlah barang minimal 1' })
  quantity: number;
}
