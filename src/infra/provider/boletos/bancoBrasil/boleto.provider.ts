import { Injectable } from '@nestjs/common';
import {
  GenerateBoletoDto,
  BoletoResponse,
} from '../interface/boleto.interface';

@Injectable()
export class BoletoProvider {
  async generateBoleto(data: GenerateBoletoDto): Promise<BoletoResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const barcode = '00190500954014481606906809350314337370000000100';
    const digitableLine =
      '00190.50095 40144.816069 06809.350314 3 7370000000100';

    return {
      barcode,
      digitableLine,
      dueDate: data.dueDate,
      amount: data.amount,
    };
  }
}
