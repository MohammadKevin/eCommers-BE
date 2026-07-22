import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApplyVoucherDto {
  @ApiProperty({ example: 'DISKON50K' })
  @IsString()
  @IsNotEmpty({ message: 'Kode voucher wajib diisi' })
  code: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  subtotalAmount: number;

  @ApiPropertyOptional({ example: 'store-uuid-here' })
  @IsOptional()
  @IsString()
  storeId?: string;
}
