import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Order ID wajib diisi' })
  orderId: string;

  @ApiProperty({ example: 'BCA_VA' })
  @IsString()
  @IsNotEmpty({ message: 'Metode pembayaran wajib diisi' })
  paymentMethod: string;
}
