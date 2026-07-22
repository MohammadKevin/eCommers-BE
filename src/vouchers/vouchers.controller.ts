import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Buat kupon / voucher diskon baru (Admin / Seller)' })
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.createVoucher(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar voucher diskon aktif yang tersedia' })
  getAvailableVouchers(@Query('storeId') storeId?: string) {
    return this.vouchersService.getAvailableVouchers(storeId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('apply')
  @ApiOperation({ summary: 'Gunakan dan hitung nilai diskon voucher' })
  applyVoucher(@Body() dto: ApplyVoucherDto) {
    return this.vouchersService.applyVoucher(dto);
  }
}
