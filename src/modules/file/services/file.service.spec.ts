import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bullmq';
import { File } from '@nest-lab/fastify-multer';
import { Repository } from 'typeorm';
import {
  FileMetadata,
  FileMetadataStatus,
} from '../entities/fileMetadata.entity';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let fileMetadaRepository: Repository<FileMetadata>;
  let queue: Queue;
  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  } as unknown as Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: 'PROCESS_CSV_ROW',
          useValue: mockQueue,
        },
        {
          provide: 'FileMetadataRepository',
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            create: jest.fn().mockImplementation((data) => data),
            save: jest.fn().mockResolvedValue({
              id: 1,
              file_name: 'test.csv',
              file_type: 'text/csv',
              total_register: 0,
              status: FileMetadataStatus.PENDING,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    await new Promise((resolve) => setTimeout(resolve, 100));
    fileMetadaRepository = module.get<Repository<FileMetadata>>(
      'FileMetadataRepository',
    );
    queue = module.get<Queue>('PROCESS_CSV_ROW');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processFile', () => {
    it('should process a valid CSV file', async () => {
      const file: File = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('header1,header2\nvalue1,value2'),
        size: 1024,
        destination: '/tmp',
        filename: 'test.csv',
        path: '/tmp/test.csv',
      };

      const queueAddSpy = jest.spyOn(queue, 'add').mockResolvedValue({} as Job);
      await service.processFile(file);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(fileMetadaRepository.create).toHaveBeenCalledWith({
        file_name: 'test.csv',
        file_type: 'text/csv',
        total_register: 0,
        status: FileMetadataStatus.PENDING,
      });

      expect(fileMetadaRepository.save).toHaveBeenCalledTimes(1);

      expect(queueAddSpy).toHaveBeenCalled();
    });
  });
});
