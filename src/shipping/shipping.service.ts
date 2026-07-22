import { Injectable } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

export interface ShippingOption {
  courierName: string;
  courierService: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

@Injectable()
export class ShippingService {
  async calculateShipping(dto: CalculateShippingDto): Promise<{ origin: string; destination: string; weightInKg: number; options: ShippingOption[] }> {
    const weightInKg = Math.ceil(dto.weightInGrams / 1000);
    const isSameCity = dto.originCity.toLowerCase().trim() === dto.destinationCity.toLowerCase().trim();

    const baseRateJNE = isSameCity ? 9000 : 15000;
    const baseRateSiCepat = isSameCity ? 8000 : 14000;
    const baseRateJnT = isSameCity ? 10000 : 16000;

    const options: ShippingOption[] = [
      {
        courierName: 'JNE',
        courierService: 'REG',
        description: 'JNE Layanan Reguler',
        cost: baseRateJNE * weightInKg,
        estimatedDays: isSameCity ? '1-2 hari' : '2-3 hari',
      },
      {
        courierName: 'JNE',
        courierService: 'YES',
        description: 'JNE Yakin Esok Sampai',
        cost: (baseRateJNE + 8000) * weightInKg,
        estimatedDays: '1 hari',
      },
      {
        courierName: 'SiCepat',
        courierService: 'REG',
        description: 'SiCepat Reguler',
        cost: baseRateSiCepat * weightInKg,
        estimatedDays: isSameCity ? '1-2 hari' : '2-3 hari',
      },
      {
        courierName: 'J&T Express',
        courierService: 'EZ',
        description: 'J&T EZ Service',
        cost: baseRateJnT * weightInKg,
        estimatedDays: isSameCity ? '1-2 hari' : '2-4 hari',
      },
    ];

    if (isSameCity) {
      options.push({
        courierName: 'GoSend / GrabExpress',
        courierService: 'INSTANT',
        description: 'Pengiriman Instant (Maksimal 3 Jam)',
        cost: 20000,
        estimatedDays: '3 jam',
      });
    }

    return {
      origin: dto.originCity,
      destination: dto.destinationCity,
      weightInKg,
      options,
    };
  }
}
