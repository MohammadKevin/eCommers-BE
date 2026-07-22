import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CalculateShippingDto {
  @ApiProperty({ example: 'Jakarta Selatan' })
  @IsString()
  @IsNotEmpty({ message: 'Kota asal pengiriman wajib diisi' })
  originCity: string;

  @ApiProperty({ example: 'Bandung' })
  @IsString()
  @IsNotEmpty({ message: 'Kota tujuan pengiriman wajib diisi' })
  destinationCity: string;

  @ApiProperty({ example: 1500 })
  @IsInt({ message: 'Berat total harus berupa angka gram' })
  @Min(1, { message: 'Berat total minimal 1 gram' })
  weightInGrams: number;
}
