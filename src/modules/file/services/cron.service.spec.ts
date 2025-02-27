import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileRow } from '../entities/fileRow.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';

describe('CronService', () => {
  let service: CronService;
  let fileRowRepository: Repository<FileRow>;
  let kafkaProducer: KafkaProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: getRepositoryToken(FileRow),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: KafkaProducer,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(undefined),
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

    service = module.get<CronService>(CronService);
    fileRowRepository = module.get<Repository<FileRow>>(
      getRepositoryToken(FileRow),
    );
    kafkaProducer = module.get<KafkaProducer>(KafkaProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('should call queue.add for each fileRow with status PENDING', async () => {
      const mockFileRows = [
        { status: 'PENDING', created_at: new Date() } as FileRow,
        { status: 'PENDING', created_at: new Date() } as FileRow,
      ];
      jest.spyOn(fileRowRepository, 'find').mockResolvedValue(mockFileRows);

      await service.handleCron();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(fileRowRepository.find).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        take: 1000,
        order: { created_at: 'DESC' },
      });

      expect(kafkaProducer.sendMessage).toHaveBeenCalled();
    });
  });
});
