import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('calculate')
  @ApiOperation({ summary: 'Kalkulasi ongkos kirim (JNE, SiCepat, J&T, Instant) berdasarkan lokasi & berat' })
  calculateShipping(@Body() dto: CalculateShippingDto) {
    return this.shippingService.calculateShipping(dto);
  }
}
