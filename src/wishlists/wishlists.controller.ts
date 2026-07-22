import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistsService } from './wishlists.service';

@ApiTags('Wishlists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Tambah / Hapus produk dari daftar impian (Wishlist)' })
  toggleWishlist(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistsService.toggleWishlist(userId, productId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar produk favorit pembeli (Wishlist)' })
  getUserWishlists(@CurrentUser('id') userId: string) {
    return this.wishlistsService.getUserWishlists(userId);
  }
}
