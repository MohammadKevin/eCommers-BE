import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, StoreRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    return `ORD-${dateStr}-${randomHex}`;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat pengiriman tidak ditemukan');
    }

    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Toko tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotalAmount = 0;
      const orderItemsData: {
        variantId: string;
        productName: string;
        variantName: string;
        sku: string;
        imageUrl: string | null;
        price: number;
        quantity: number;
      }[] = [];

      for (const itemDto of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: itemDto.variantId },
          include: {
            product: { select: { name: true, storeId: true } },
          },
        });

        if (!variant) {
          throw new NotFoundException(`Varian dengan ID ${itemDto.variantId} tidak ditemukan`);
        }

        if (variant.product.storeId !== dto.storeId) {
          throw new BadRequestException(`Produk ${variant.product.name} tidak berasal dari toko ini`);
        }

        if (variant.stock < itemDto.quantity) {
          throw new BadRequestException(`Stok varian ${variant.name} tidak mencukupi (tersedia: ${variant.stock})`);
        }

        const itemPrice = Number(variant.price);
        const itemTotal = itemPrice * itemDto.quantity;
        subtotalAmount += itemTotal;

        orderItemsData.push({
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name,
          sku: variant.sku,
          imageUrl: variant.imageUrl,
          price: itemPrice,
          quantity: itemDto.quantity,
        });

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: { decrement: itemDto.quantity },
          },
        });
      }

      const discountAmount = 0;
      const totalAmount = subtotalAmount + dto.shippingCost - discountAmount;
      const orderNumber = this.generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          storeId: dto.storeId,
          voucherId: dto.voucherId,
          subtotalAmount,
          discountAmount,
          shippingCost: dto.shippingCost,
          totalAmount,
          shippingRecipient: address.recipient,
          shippingPhone: address.phone,
          shippingAddress: address.fullAddress,
          shippingCity: address.city,
          shippingProvince: address.province,
          shippingPostalCode: address.postalCode,
          status: OrderStatus.PENDING_PAYMENT,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      });

      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        const variantIdsPurchased = dto.items.map((i) => i.variantId);
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            variantId: { in: variantIdsPurchased },
          },
        });
      }

      return order;
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        store: { select: { id: true, name: true, slug: true, logoUrl: true } },
        payment: { select: { id: true, status: true, paymentMethod: true, snapToken: true } },
      },
    });
  }

  async getStoreOrders(userId: string, storeId: string) {
    const member = await this.prisma.storeMember.findUnique({
      where: { storeId_userId: { storeId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan toko ini');
    }

    return this.prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
        payment: { select: { id: true, status: true, paymentMethod: true } },
      },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        store: { select: { id: true, name: true, slug: true, logoUrl: true, city: true } },
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.buyerId !== userId) {
      const member = await this.prisma.storeMember.findUnique({
        where: { storeId_userId: { storeId: order.storeId, userId } },
      });
      if (!member) {
        throw new ForbiddenException('Anda tidak memiliki akses ke rincian pesanan ini');
      }
    }

    return order;
  }

  async updateOrderStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const member = await this.prisma.storeMember.findUnique({
      where: { storeId_userId: { storeId: order.storeId, userId } },
    });

    if (!member || (member.role !== StoreRole.OWNER && member.role !== StoreRole.ADMIN)) {
      throw new ForbiddenException('Anda tidak memiliki izin mengubah status pesanan ini');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }
}
