import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from './upload.service';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';
import { FileStorageService } from './fileStorage.service';
import { Logger } from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';

describe('UploadService', () => {
  let uploadService: UploadService;
  let fileMetadataRepository: Repository<FileMetadata>;
  let fileStorageService: FileStorageService;
  let kafkaProducer: KafkaProducer;

  // Mock do File
  const mockFile: File = {
    fieldname: 'file',
    originalname: 'test.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: Buffer.from('teste,1,2,3'),
    size: 123,
  };

  // Mock do FileMetadata
  const mockFileMetadata: FileMetadata = {
    id: 1,
    file_name: 'test.csv',
    file_type: 'text/csv',
    total_register: 0,
    status: FileMetadataStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
    fileRows: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: getRepositoryToken(FileMetadata),
          useValue: {
            create: jest.fn().mockReturnValue(mockFileMetadata),
            save: jest.fn().mockResolvedValue(mockFileMetadata),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            saveFile: jest.fn().mockResolvedValue('/uploads/test.csv'),
          },
        },
        {
          provide: KafkaProducer,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(null),
          },
        },
        Logger,
      ],
    }).compile();

    uploadService = module.get<UploadService>(UploadService);
    fileMetadataRepository = module.get<Repository<FileMetadata>>(
      getRepositoryToken(FileMetadata),
    );
    fileStorageService = module.get<FileStorageService>(FileStorageService);
    kafkaProducer = module.get<KafkaProducer>(KafkaProducer);
  });

  it('should be defined', () => {
    expect(uploadService).toBeDefined();
  });

  describe('processFile', () => {
    it('should save the file to storage', async () => {
      await uploadService.processFile(mockFile);
      expect(fileStorageService.saveFile).toHaveBeenCalledWith(mockFile);
    });

    it('should create and save metadata in the database', async () => {
      await uploadService.processFile(mockFile);
      expect(fileMetadataRepository.create).toHaveBeenCalledWith({
        file_name: mockFile.originalname,
        file_type: mockFile.mimetype,
        total_register: 0,
        status: FileMetadataStatus.PENDING,
      });
      expect(fileMetadataRepository.save).toHaveBeenCalledWith(
        mockFileMetadata,
      );
    });

    it('should publish a message to Kafka', async () => {
      await uploadService.processFile(mockFile);
      expect(kafkaProducer.sendMessage).toHaveBeenCalled();
    });
  });
});
