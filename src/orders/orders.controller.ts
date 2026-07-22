import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pesanan baru (Checkout)' })
  createOrder(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar riwayat pesanan milik pembeli' })
  getUserOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getUserOrders(userId);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Daftar pesanan toko (Seller view)' })
  getStoreOrders(@CurrentUser('id') userId: string, @Param('storeId') storeId: string) {
    return this.ordersService.getStoreOrders(userId, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail rincian pesanan' })
  getOrderById(@CurrentUser('id') userId: string, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(userId, orderId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status pesanan (Seller/Admin)' })
  updateOrderStatus(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(userId, orderId, dto);
  }
}
