import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Readable } from 'stream';
import { File } from '@nest-lab/fastify-multer';
import { parse } from 'fast-csv';
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

    const csvStream = parse({ headers: true })
      .on('data', (row) => {
        try {
          this.queue
            .add('process-csv-row', {
              row,
              fileMetadata: fileMetadataSave,
            })
            .catch((error) => this.logger.log(error));
        } catch (error) {
          this.logger.error('Erro ao processar linha:', error);
        }
      })
      .on('end', () => {
        this.logger.log('Processamento do CSV concluído.');
      })
      .on('error', (error) => {
        this.logger.error('Erro ao processar o CSV:', error);
      });

    stream.pipe(csvStream);
  }
}
