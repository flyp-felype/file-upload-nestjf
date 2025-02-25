import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { File } from '@nest-lab/fastify-multer';
import { FileDto } from '../../file/dto/file-request.dto';

@Injectable()
export class DebitsService {
  private readonly logger = new Logger(DebitsService.name);

  constructor(@Inject('CSV_QUEUE') private readonly queue: Queue) {}

  processFile(file: File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo inválido ou ausente.');
    }

    const stream = Readable.from(file.buffer);

    stream
      .pipe(csv())
      .on('data', (row: FileDto) => {
        console.log(`ADICIONANDO NO JOB => ${JSON.stringify(row)}`);
        this.queue
          .add('csv-processing', { row })
          .catch((error) => this.logger.error(error));
      })
      .on('end', () => {
        this.logger.log('Processamento do CSV concluído.');
      })
      .on('error', (error) => {
        this.logger.error('Erro ao processar o CSV:', error);
      });
  }
}
