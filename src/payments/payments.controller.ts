import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Buat transaksi pembayaran pesanan (generate snap token)' })
  createPayment(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(userId, dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  @ApiOperation({ summary: 'Endpoint callback / webhook dari Payment Gateway (Midtrans/Xendit)' })
  handleWebhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Status transaksi pembayaran berdasarkan ID pesanan' })
  getPaymentByOrder(@CurrentUser('id') userId: string, @Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(userId, orderId);
  }
}
