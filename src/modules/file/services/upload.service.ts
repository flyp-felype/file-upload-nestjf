import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';
import { File } from '@nest-lab/fastify-multer';
import { FileStorageService } from './fileStorage.service.spec';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(FileMetadata)
    private fileMetadaRepository: Repository<FileMetadata>,
    private readonly fileStorageService: FileStorageService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async processFile(file: File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo inválido ou ausente.');
    }

    // Salvar o arquivo no storage local
    // AQUI PODEMOS USAR UM S3
    const filePath = this.fileStorageService.saveFile(file);

    const fileMetadata = this.fileMetadaRepository.create({
      file_name: file.originalname,
      file_type: file.mimetype,
      total_register: 0,
      status: FileMetadataStatus.PENDING,
    });

    const fileMetadataSave = await this.fileMetadaRepository.save(fileMetadata);

    await this.kafkaProducer.sendMessage('file-ready-for-processing', {
      fileMetadata: fileMetadataSave,
      filePath,
    });

    this.logger.log(`Arquivo salvo e evento publicado: ${file.originalname}`);
  }
}
