import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { File } from '@nest-lab/fastify-multer';
import { parse } from 'fast-csv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @InjectRepository(FileMetadata)
    private fileMetadaRepository: Repository<FileMetadata>,

    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async processFile(file: File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo inválido ou ausente.');
    }

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
        this.kafkaProducer
          .sendMessage('process-csv-row', {
            row,
            fileMetadata: fileMetadataSave,
          })
          .catch((error) => {
            this.logger.error('Erro ao enviar mensagem para o Kafka:', error);
          });
      })
      .on('end', () => {
        this.logger.log('Processamento do CSV concluído.');
      })
      .on('error', (error) => {
        console.log('Erro ao processar o CSV:', error);
      });

    stream.pipe(csvStream);
  }
}
