import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Pesanan tidak dalam status menunggu pembayaran (Status: ${order.status})`);
    }

    const snapToken = `SNAP-DEMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const referenceId = `PAY-${order.orderNumber}`;

    if (order.payment) {
      return this.prisma.paymentTransaction.update({
        where: { id: order.payment.id },
        data: {
          paymentMethod: dto.paymentMethod,
          status: PaymentStatus.PENDING,
          snapToken,
          referenceId,
        },
      });
    }

    return this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        paymentMethod: dto.paymentMethod,
        provider: 'MIDTRANS',
        referenceId,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
        snapToken,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Jam
      },
    });
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payment = await this.prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { orderId: dto.orderId },
          { referenceId: dto.referenceId },
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Transaksi pembayaran tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: dto.status,
          paidAt: dto.status === PaymentStatus.SUCCESS ? new Date() : null,
        },
      });

      if (dto.status === PaymentStatus.SUCCESS) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        });
      } else if (dto.status === PaymentStatus.FAILED || dto.status === PaymentStatus.EXPIRED) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }

      return updatedPayment;
    });
  }

  async getPaymentByOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('Akses ditolak');
    }

    return order.payment;
  }
}
