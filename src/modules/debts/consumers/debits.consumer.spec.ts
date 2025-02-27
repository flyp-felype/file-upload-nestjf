import { Test, TestingModule } from '@nestjs/testing';
import { DebitsConsumer } from './debits.consumer';
import { DebitsService } from '../services/debits.service';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  FileRow,
  FileRowStatus,
} from '../../../modules/file/entities/fileRow.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DebitsConsumer', () => {
  let debitsConsumer: DebitsConsumer;
  let debitsService: DebitsService;
  let fileRowRepository: Repository<FileRow>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebitsConsumer,
        {
          provide: DebitsService,
          useValue: {
            processRow: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FileRow),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    debitsConsumer = module.get<DebitsConsumer>(DebitsConsumer);
    debitsService = module.get<DebitsService>(DebitsService);
    fileRowRepository = module.get<Repository<FileRow>>(
      getRepositoryToken(FileRow),
    );
  });

  it('should be defined', () => {
    expect(debitsConsumer).toBeDefined();
  });

  describe('consume', () => {
    it('should log, update fileRow status, and call debitsService.processRow when message is provided', async () => {
      const message = {
        fileRow: {
          id: 1,
          status: FileRowStatus.PENDING,
        },
      };

      await debitsConsumer.consume(message);

      expect(fileRowRepository.update).toHaveBeenCalledWith(
        { id: message.fileRow.id },
        { status: FileRowStatus.EXECUTING, updated_at: expect.any(Date) },
      );
      expect(debitsService.processRow).toHaveBeenCalledWith(
        message.fileRow as FileRow,
      );
    });
  });
});
