import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileRow, FileRowStatus } from '../entities/fileRow.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller()
export class ProcessCsvRowConsumer {
  protected readonly logger = new Logger(ProcessCsvRowConsumer.name);
  constructor(
    @InjectRepository(FileRow)
    private fileRowRepository: Repository<FileRow>,
  ) {}
  @MessagePattern('process-csv-row')
  async consume(@Payload() message: any) {
    try {
      if (!message) {
        throw new Error('Messagem do kafka indisponívle');
      }

      this.logger.log(`Processando linha do CSV: ${JSON.stringify(message)}`);

      const fileRow = this.fileRowRepository.create({
        row: JSON.stringify(message.row),
        fileMetadata: message.fileMetadata,
        status: FileRowStatus.PENDING,
      });

      await this.fileRowRepository.save(fileRow);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
