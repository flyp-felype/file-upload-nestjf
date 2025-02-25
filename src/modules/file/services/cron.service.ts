import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { FileRow, FileRowStatus } from '../entities/fileRow.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @Inject('CSV_QUEUE') private readonly queue: Queue,
    @InjectRepository(FileRow)
    private fileRowRepository: Repository<FileRow>,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    this.logger.log('Executando tarefa agendada a cada 30 segundos');
    const fileRows = await this.fileRowRepository.find({
      where: { status: FileRowStatus.PENDING },
      take: 1000,
      order: { created_at: 'DESC' },
    });

    for (let index = 0; index < fileRows.length; index++) {
      const fileRow = fileRows[index];
      this.queue
        .add('debits-processing', { fileRow: fileRow })
        .catch((error) => this.logger.error(error));
    }
  }
}
