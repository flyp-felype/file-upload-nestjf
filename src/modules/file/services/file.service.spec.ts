import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';
import { Repository } from 'typeorm';

describe('FileService', () => {
  let fileService: FileService;
  let kafkaProducer: KafkaProducer;
  let fileMetadataRepository: Repository<FileMetadata>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: KafkaProducer,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(FileMetadata),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
          },
        },
      ],
    }).compile();

    fileService = module.get<FileService>(FileService);
    kafkaProducer = module.get<KafkaProducer>(KafkaProducer);
    fileMetadataRepository = module.get<Repository<FileMetadata>>(
      getRepositoryToken(FileMetadata),
    );
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  it('should save the file metadata correctly', async () => {
    const mockFile: any = {
      originalname: 'test.csv',
      mimetype: 'text/csv',
      buffer: Buffer.from('id,name\n1,John\n2,Jane'),
    };

    await fileService.processFile(mockFile);

    expect(fileMetadataRepository.create).toHaveBeenCalledWith({
      file_name: 'test.csv',
      file_type: 'text/csv',
      total_register: 0,
      status: FileMetadataStatus.PENDING,
    });

    expect(fileMetadataRepository.save).toHaveBeenCalled();
  });

  it('should call KafkaProducer for each row of the CS', async () => {
    const mockFile: any = {
      originalname: 'test.csv',
      mimetype: 'text/csv',
      buffer: Buffer.from('id,name\n1,John\n2,Jane'),
    };

    await fileService.processFile(mockFile);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(kafkaProducer.sendMessage).toHaveBeenCalled();
  });
});
