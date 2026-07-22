import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false, message: 'Produk dihapus dari wishlist' };
    }

    await this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    return { isFavorited: true, message: 'Produk ditambahkan ke wishlist' };
  }

  async getUserWishlists(userId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: { take: 1 },
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return wishlists.map((w) => w.product);
  }
}
