import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Kode voucher sudah digunakan');
    }

    return this.prisma.voucher.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
      },
    });
  }

  async getAvailableVouchers(storeId?: string) {
    const now = new Date();
    return this.prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { storeId: null },
          storeId ? { storeId } : {},
        ],
      },
      orderBy: { endDate: 'asc' },
    });
  }

  async applyVoucher(dto: ApplyVoucherDto) {
    const now = new Date();
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!voucher || !voucher.isActive) {
      throw new NotFoundException('Voucher tidak ditemukan atau tidak aktif');
    }

    if (now < voucher.startDate || now > voucher.endDate) {
      throw new BadRequestException('Masa berlaku voucher telah berakhir');
    }

    if (voucher.quota <= voucher.usedCount) {
      throw new BadRequestException('Kuota penggunaan voucher telah habis');
    }

    if (voucher.storeId && dto.storeId && voucher.storeId !== dto.storeId) {
      throw new BadRequestException('Voucher ini hanya berlaku untuk toko tertentu');
    }

    if (voucher.minPurchase && dto.subtotalAmount < Number(voucher.minPurchase)) {
      throw new BadRequestException(`Minimal belanja untuk voucher ini adalah Rp ${Number(voucher.minPurchase).toLocaleString('id-ID')}`);
    }

    let calculatedDiscount = 0;
    if (voucher.discountAmount) {
      calculatedDiscount = Number(voucher.discountAmount);
    } else if (voucher.discountPercent) {
      calculatedDiscount = (dto.subtotalAmount * voucher.discountPercent) / 100;
      if (voucher.maxDiscount && calculatedDiscount > Number(voucher.maxDiscount)) {
        calculatedDiscount = Number(voucher.maxDiscount);
      }
    }

    return {
      voucherId: voucher.id,
      code: voucher.code,
      discountAmount: calculatedDiscount,
      finalAmount: Math.max(0, dto.subtotalAmount - calculatedDiscount),
    };
  }
}
