import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from 'src/config/redis.config';
import { InvoiceService } from '../services/invoice.service';
@Injectable()
export class InvoiceProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InvoiceProcessorService.name);
  private worker: Worker;
  constructor(private readonly invoiceService: InvoiceService) {}

  onModuleInit() {
    this.worker = new Worker(
      'invoice-generate',
      async (job: Job<{ debtId: string }>) => {
        this.logger.log('Processando debito:', job.data.debtId);
        await this.invoiceService.handle(job.data.debtId);
      },
      { connection: createRedisConnection() },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} processado com sucesso.`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} falhou:`, err);
    });
  }

  onModuleDestroy() {
    this.worker.close();
  }
}
