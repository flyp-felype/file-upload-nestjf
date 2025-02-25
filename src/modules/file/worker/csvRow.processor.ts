import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../../../config/redis.config';
import { FileDto } from '../dto/file-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRow, FileRowStatus } from '../entities/fileRow.entity';
import { FileMetadata } from '../entities/fileMetadata.entity';

@Injectable()
export class CsvProcessorRowService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CsvProcessorRowService.name);
  private worker: Worker;

  constructor(
    @InjectRepository(FileRow)
    private fileRowRepository: Repository<FileRow>,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'process-csv-row',
      async (job: Job<{ row: FileDto; fileMetadata: FileMetadata }>) => {
        await this.processJob(job);
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

  async processJob(job: Job<{ row: FileDto; fileMetadata: FileMetadata }>) {
    this.logger.log('Processando linha:', job.data.row);

    const { row, fileMetadata } = job.data;

    const fileRow = this.fileRowRepository.create({
      row: JSON.stringify(row),
      fileMetadata: fileMetadata,
      status: FileRowStatus.PENDING,
    });

    await this.fileRowRepository.save(fileRow);
  }

  onModuleDestroy() {
    this.worker.close();
  }
}
