import { Controller, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileRow,
  FileRowStatus,
} from '../../../modules/file/entities/fileRow.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DebitsService } from '../services/debits.service';

@Controller()
export class DebitsConsumer {
  protected readonly logger = new Logger(DebitsConsumer.name);
  constructor(
    private readonly debitsService: DebitsService,
    @InjectRepository(FileRow)
    private fileRowRepository: Repository<FileRow>,
  ) {}
  @MessagePattern('debits-processing')
  async consume(@Payload() message: any) {
    try {
      if (!message) {
        throw new Error('Messagem do kafka indisponívle');
      }

      this.logger.log(`Processando o débito: ${JSON.stringify(message)}`);

      const fileRow = message.fileRow;
      await this.fileRowRepository.update(
        { id: fileRow.id },
        { status: FileRowStatus.EXECUTING, updated_at: new Date() },
      );
      await this.debitsService.processRow(fileRow as FileRow);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
