import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async createStore(userId: string, dto: CreateStoreDto) {
    const existingName = await this.prisma.store.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException('Nama toko sudah digunakan');
    }

    const existingSlug = await this.prisma.store.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Slug toko sudah digunakan');
    }

    return this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: dto,
      });

      await tx.storeMember.create({
        data: {
          storeId: store.id,
          userId,
          role: StoreRole.OWNER,
        },
      });

      return store;
    });
  }

  async getMyStores(userId: string) {
    const members = await this.prisma.storeMember.findMany({
      where: { userId },
      include: {
        store: true,
      },
    });

    return members.map((m) => ({
      ...m.store,
      userRole: m.role,
    }));
  }

  async getStoreBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isPublished: true },
          take: 12,
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: { take: 1 },
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Toko tidak ditemukan');
    }

    return store;
  }

  async updateStore(userId: string, storeId: string, dto: UpdateStoreDto) {
    const member = await this.prisma.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId,
        },
      },
    });

    if (!member || (member.role !== StoreRole.OWNER && member.role !== StoreRole.ADMIN)) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengedit toko ini');
    }

    if (dto.slug) {
      const existingSlug = await this.prisma.store.findFirst({
        where: { slug: dto.slug, NOT: { id: storeId } },
      });
      if (existingSlug) {
        throw new ConflictException('Slug toko sudah digunakan');
      }
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: dto,
    });
  }
}
