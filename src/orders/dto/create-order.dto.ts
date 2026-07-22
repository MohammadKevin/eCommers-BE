import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 'store-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Store ID wajib diisi' })
  storeId: string;

  @ApiProperty({ example: 'address-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat pengiriman wajib diisi' })
  addressId: string;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  @Min(0)
  shippingCost: number;

  @ApiPropertyOptional({ example: 'voucher-uuid-here' })
  @IsOptional()
  @IsString()
  voucherId?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan minimal berisi 1 item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
