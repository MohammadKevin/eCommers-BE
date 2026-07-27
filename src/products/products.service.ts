import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Category Management
  async createCategory(dto: CreateCategoryDto) {
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug kategori sudah ada');
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
      },
    });
  }

  // Product Management
  async createProduct(userId: string, dto: CreateProductDto) {
    const member = await this.prisma.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId: dto.storeId,
          userId,
        },
      },
    });

    if (!member || (member.role !== StoreRole.OWNER && member.role !== StoreRole.ADMIN)) {
      throw new ForbiddenException('Anda tidak memiliki izin menambah produk di toko ini');
    }

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Slug produk sudah digunakan');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId: dto.storeId,
          categoryId: dto.categoryId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          isPublished: dto.isPublished ?? true,
          variants: {
            create: dto.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              price: v.price,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock,
              imageUrl: v.imageUrl,
            })),
          },
          images: dto.images && dto.images.length > 0
            ? {
                create: dto.images.map((url, idx) => ({
                  imageUrl: url,
                  isPrimary: idx === 0,
                  sortOrder: idx,
                })),
              }
            : undefined,
        },
        include: {
          variants: true,
          images: true,
          store: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          category: true,
        },
      });

      return product;
    });
  }

  async getProducts(query: QueryProductDto) {
    const { search, categoryId, storeId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { take: 1 },
          store: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        store: { select: { id: true, name: true, slug: true, logoUrl: true, city: true } },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product;
  }

  async clearAllProducts() {
    await this.prisma.cartItem.deleteMany({});
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.wishlist.deleteMany({});
    await this.prisma.review.deleteMany({});
    await this.prisma.productImage.deleteMany({});
    await this.prisma.productVariant.deleteMany({});
    await this.prisma.product.deleteMany({});
    return { message: 'Semua produk dummy di database telah dibersihkan.' };
  }

  async deleteProduct(productId: string) {
    await this.prisma.cartItem.deleteMany({ where: { variant: { productId } } });
    await this.prisma.productImage.deleteMany({ where: { productId } });
    await this.prisma.productVariant.deleteMany({ where: { productId } });
    await this.prisma.product.delete({ where: { id: productId } });
    return { message: 'Produk berhasil dihapus.' };
  }
}
