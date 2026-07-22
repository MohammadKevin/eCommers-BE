import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rumah' })
  @IsString()
  @IsNotEmpty({ message: 'Label alamat wajib diisi' })
  label: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty({ message: 'Nama penerima wajib diisi' })
  recipient: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon penerima wajib diisi' })
  phone: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 45 RT 01/RW 02' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat lengkap wajib diisi' })
  fullAddress: string;

  @ApiProperty({ example: 'Jakarta Selatan' })
  @IsString()
  @IsNotEmpty({ message: 'Kota wajib diisi' })
  city: string;

  @ApiProperty({ example: 'DKI Jakarta' })
  @IsString()
  @IsNotEmpty({ message: 'Provinsi wajib diisi' })
  province: string;

  @ApiProperty({ example: '12340' })
  @IsString()
  @IsNotEmpty({ message: 'Kode pos wajib diisi' })
  postalCode: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
