import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVoucherDto {
  @ApiPropertyOptional({ example: 'store-uuid-here' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ example: 'DISKON50K' })
  @IsString()
  @IsNotEmpty({ message: 'Kode voucher wajib diisi' })
  code: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @ApiProperty({ example: '2026-07-22T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
