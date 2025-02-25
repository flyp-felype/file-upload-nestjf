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
import { FileDto } from '../dto/file-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    @InjectRepository(FileMetadata)
    private fileMetadaRepository: Repository<FileMetadata>,

    @Inject('PROCESS_CSV_ROW') private readonly queue: Queue,
  ) {}

  async processFile(file: File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo inválido ou ausente.');
    }
    console.log(file);
    const fileMetadata = this.fileMetadaRepository.create({
      file_name: file.originalname,
      file_type: file.mimetype,
      total_register: 0,
      status: FileMetadataStatus.PENDING,
    });

    const fileMetadataSave = await this.fileMetadaRepository.save(fileMetadata);

    const stream = Readable.from(file.buffer);

    stream
      .pipe(csv())
      .on('data', (row: FileDto) => {
        this.queue
          .add('process-csv-row', {
            row,
            fileMetadata: fileMetadataSave,
          })
          .catch((error) => this.logger.log(error));
      })
      .on('end', () => {
        this.logger.log('Processamento do CSV concluído.');
      })
      .on('error', (error) => {
        this.logger.error('Erro ao processar o CSV:', error);
      });
  }
}
