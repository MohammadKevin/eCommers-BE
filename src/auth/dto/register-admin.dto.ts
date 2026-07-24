import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GlobalRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({ example: 'Super Administrator' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  fullName: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: GlobalRole,
    example: GlobalRole.SUPER_ADMIN,
    description: 'Pilihan role penting: SUPER_ADMIN, OPERATIONS_CS, FINANCE_ADMIN, MARKETING_ADMIN',
  })
  @IsEnum(GlobalRole, { message: 'Global role tidak valid' })
  @IsNotEmpty({ message: 'Global role wajib diisi' })
  globalRole: GlobalRole;

  @ApiProperty({
    example: 'secret-admin-key-2026',
    description: 'Secret Key rahasia untuk otorisasi pembuatan akun admin/staf',
  })
  @IsString()
  @IsNotEmpty({ message: 'Secret Key wajib diisi' })
  secretKey: string;
}
