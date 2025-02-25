import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from 'src/config/redis.config';
import { ProcessRowService } from '../services/processRow.service';
import { FileRow, FileRowStatus } from '../../file/entities/fileRow.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DebitsProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DebitsProcessorService.name);
  private worker: Worker;
  constructor(
    private readonly processRowService: ProcessRowService,
    @InjectRepository(FileRow)
    private fileRowRepository: Repository<FileRow>,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'debits-processing',
      async (job: Job<{ fileRow: FileRow }>) => {
        this.logger.log('Processando linha:', job.data.fileRow);
        const fileRow = job.data.fileRow;
        await this.fileRowRepository.update(
          { id: fileRow.id },
          { status: FileRowStatus.EXECUTING, updated_at: new Date() },
        );
        await this.processRowService.processRow(job.data.fileRow);
      },
      { connection: createRedisConnection() },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} processado com sucesso.`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} falhou:`, err);
    });
  }

  onModuleDestroy() {
    this.worker.close();
  }
}
