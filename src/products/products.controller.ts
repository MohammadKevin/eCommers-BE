import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Dapatkan hierarki daftar kategori produk' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('categories')
  @ApiOperation({ summary: 'Tambah kategori produk baru' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar produk dengan pencarian dan filter' })
  getProducts(@Query() query: QueryProductDto) {
    return this.productsService.getProducts(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Detail produk lengkap berdasarkan slug' })
  getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tambah produk baru berserta varian & foto' })
  createProduct(@CurrentUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(userId, dto);
  }
}
