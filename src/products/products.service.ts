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
    // 1. Resolve & Check Store Access
    let storeId = dto.storeId;
    let store = await this.prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      // Find user's actual store from database
      const userMember = await this.prisma.storeMember.findFirst({
        where: { userId },
        include: { store: true },
      });
      if (userMember?.store) {
        store = userMember.store;
        storeId = store.id;
      } else {
        throw new NotFoundException('Toko tidak ditemukan. Silakan buat toko terlebih dahulu.');
      }
    }

    let member = await this.prisma.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId,
        },
      },
    });

    if (!member) {
      member = await this.prisma.storeMember.create({
        data: {
          storeId,
          userId,
          role: StoreRole.OWNER,
        },
      });
    }

    // 2. Resolve Category
    let categoryId = dto.categoryId;
    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      const firstCat = await this.prisma.category.findFirst();
      if (firstCat) {
        categoryId = firstCat.id;
      } else {
        const newCat = await this.prisma.category.create({
          data: {
            name: 'Elektronik & Laptop',
            slug: 'elektronik-laptop',
          },
        });
        categoryId = newCat.id;
      }
    }

    // 3. Ensure Unique Slug
    let productSlug = dto.slug;
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: productSlug },
    });
    if (existingSlug) {
      productSlug = `${productSlug}-${Date.now()}`;
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId,
          categoryId,
          name: dto.name,
          slug: productSlug,
          description: dto.description,
          isPublished: dto.isPublished ?? true,
          variants: {
            create: dto.variants.map((v) => ({
              sku: v.sku || `SKU-${Date.now()}`,
              name: v.name || 'Standard',
              price: v.price,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock ?? 10,
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
    try {
      await this.prisma.cartItem.deleteMany({});
      await this.prisma.orderItem.deleteMany({});
      await this.prisma.wishlist.deleteMany({});
      await this.prisma.review.deleteMany({});
      await this.prisma.productImage.deleteMany({});
      await this.prisma.productVariant.deleteMany({});
      await this.prisma.product.deleteMany({});
    } catch (err) {
      console.error('Error clearing products:', err);
    }
    return { message: 'Semua produk dummy di database telah dibersihkan.' };
  }

  async deleteProduct(productId: string) {
    try {
      await this.prisma.cartItem.deleteMany({ where: { variant: { productId } } });
      await this.prisma.productImage.deleteMany({ where: { productId } });
      await this.prisma.productVariant.deleteMany({ where: { productId } });
      await this.prisma.product.delete({ where: { id: productId } });
    } catch (err) {
      console.error('Error deleting product:', err);
    }
    return { message: 'Produk berhasil dihapus.' };
  }
}
