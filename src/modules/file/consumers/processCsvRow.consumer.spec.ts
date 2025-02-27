import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCsvRowConsumer } from './processCsvRow.consumer';
import { Repository } from 'typeorm';
import { FileRow, FileRowStatus } from '../entities/fileRow.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProcessCsvRowConsumer', () => {
  let processCsvRowConsumer: ProcessCsvRowConsumer;
  let fileRowRepository: Repository<FileRow>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessCsvRowConsumer,
        {
          provide: getRepositoryToken(FileRow),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    processCsvRowConsumer = module.get<ProcessCsvRowConsumer>(
      ProcessCsvRowConsumer,
    );
    fileRowRepository = module.get<Repository<FileRow>>(
      getRepositoryToken(FileRow),
    );
  });

  it('should be defined', () => {
    expect(processCsvRowConsumer).toBeDefined();
  });

  describe('consume', () => {
    it('should log, create, and save a FileRow when message is provided', async () => {
      const message = {
        row: { id: 1, name: 'Test Row' },
        fileMetadata: { id: 1, filename: 'test.csv' },
      };

      const createdFileRow = {
        row: JSON.stringify(message.row),
        fileMetadata: message.fileMetadata,
        status: FileRowStatus.PENDING,
      };

      jest
        .spyOn(fileRowRepository, 'create')
        .mockReturnValue(createdFileRow as unknown as FileRow);
      jest
        .spyOn(fileRowRepository, 'save')
        .mockResolvedValue(createdFileRow as unknown as FileRow);

      await processCsvRowConsumer.consume(message);
      expect(fileRowRepository.create).toHaveBeenCalledWith({
        row: JSON.stringify(message.row),
        fileMetadata: message.fileMetadata,
        status: FileRowStatus.PENDING,
      });
      expect(fileRowRepository.save).toHaveBeenCalledWith(createdFileRow);
    });
  });
});
