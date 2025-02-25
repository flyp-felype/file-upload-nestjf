import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { CsvProcessorRowService } from './csvRow.processor';
import { Repository } from 'typeorm';
import { FileRow } from '../entities/fileRow.entity';
import { FileMetadata } from '../entities/fileMetadata.entity';
import { FileDto } from '../dto/file-request.dto';
import { FileRowStatus } from '../entities/fileRow.entity';

describe('CsvProcessorRowService', () => {
  let service: CsvProcessorRowService;
  let fileRowRepository: Repository<FileRow>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvProcessorRowService,
        {
          provide: 'FileRowRepository',
          useValue: {
            create: jest.fn().mockImplementation((data) => data),
            save: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<CsvProcessorRowService>(CsvProcessorRowService);
    fileRowRepository = module.get<Repository<FileRow>>('FileRowRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processJob', () => {
    it('should process a job and save the row', async () => {
      const mockJob = {
        data: {
          row: { header1: 'value1', header2: 'value2' } as unknown as FileDto,
          fileMetadata: {
            id: 1,
            file_name: 'test.csv',
            file_type: 'text/csv',
            total_register: 0,
            status: 'PENDING',
          } as FileMetadata,
        },
      } as Job;

      await service.processJob(mockJob);

      expect(fileRowRepository.create).toHaveBeenCalledWith({
        row: JSON.stringify(mockJob.data.row),
        fileMetadata: mockJob.data.fileMetadata,
        status: FileRowStatus.PENDING,
      });

      expect(fileRowRepository.save).toHaveBeenCalled();
    });
  });
});
