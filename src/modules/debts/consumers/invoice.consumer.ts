import { Controller, Logger } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InvoiceConsumer {
  protected readonly logger = new Logger(InvoiceConsumer.name);
  constructor(private readonly invoiceService: InvoiceService) {}
  @MessagePattern('invoice-generate')
  async consume(@Payload() message: any) {
    try {
      if (!message) {
        throw new Error('Messagem do kafka indisponívle');
      }

      this.logger.log(`Processando o boleo: ${JSON.stringify(message)}`);

      await this.invoiceService.handle(message.debtId);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
