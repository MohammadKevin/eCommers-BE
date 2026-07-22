import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Buat toko baru (Multi-vendor Seller)' })
  createStore(@CurrentUser('id') userId: string, @Body() dto: CreateStoreDto) {
    return this.storesService.createStore(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-stores')
  @ApiOperation({ summary: 'Dapatkan daftar toko milik pengguna' })
  getMyStores(@CurrentUser('id') userId: string) {
    return this.storesService.getMyStores(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Dapatkan detail publik toko berdasarkan slug' })
  getStoreBySlug(@Param('slug') slug: string) {
    return this.storesService.getStoreBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update informasi toko' })
  updateStore(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(userId, storeId, dto);
  }
}
