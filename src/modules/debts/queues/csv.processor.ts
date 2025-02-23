import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from 'src/config/redis.config';
import { ProcessRowService } from '../services/processRow.service';
import { FileDto } from '../dto/file-request.dto';

@Injectable()
export class CsvProcessorService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;
  constructor(private readonly processRowService: ProcessRowService) {}

  onModuleInit() {
    this.worker = new Worker(
      'csv-processing',
      async (job: Job<{ row: any }>) => {
        console.log('Processando linha:', job.data.row);
        await this.processRowService.processRow(job.data.row as FileDto);
      },
      { connection: createRedisConnection() },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} processado com sucesso.`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} falhou:`, err);
    });
  }

  onModuleDestroy() {
    this.worker.close();
  }
}
