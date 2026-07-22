import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ example: 'order-uuid-here' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'PAY-MIDTRANS-12345' })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.SUCCESS })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ example: 'MIDTRANS' })
  @IsOptional()
  @IsString()
  provider?: string;
}
