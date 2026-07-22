import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    const hasPurchased = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        status: { in: [OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.SHIPPED] },
        items: {
          some: {
            variant: {
              productId: dto.productId,
            },
          },
        },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException('Anda hanya dapat memberikan ulasan pada produk yang telah Anda beli');
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async getProductReviews(productId: string) {
    const [reviews, aggregate] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      reviews,
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating || 0,
    };
  }
}
