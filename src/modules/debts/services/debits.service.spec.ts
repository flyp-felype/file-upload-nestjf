import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { DebitsService } from './debits.service';
import { Debts } from '../entities/debts.entity';
import { FileRow, FileRowStatus } from '../../file/entities/fileRow.entity';
import { v4 as uuidv4 } from 'uuid';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';

describe('ProcessRowService', () => {
  let service: DebitsService;
  let debtsRepository: Repository<Debts>;
  let fileRowRepository: Repository<FileRow>;
  let kafkaProducer: KafkaProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebitsService,
        {
          provide: 'DebtsRepository',
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((data) => data),
            save: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: 'FileRowRepository',
          useValue: {
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: KafkaProducer,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<DebitsService>(DebitsService);
    debtsRepository = module.get<Repository<Debts>>('DebtsRepository');
    fileRowRepository = module.get<Repository<FileRow>>('FileRowRepository');
    kafkaProducer = module.get<KafkaProducer>(KafkaProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processRow', () => {
    it('should process a row and create a new debt', async () => {
      const uuid = uuidv4();
      const mockFileRow = {
        id: 1,
        row: JSON.stringify({
          debtId: uuid,
          name: 'John Doe',
          governmentId: '123456789',
          email: 'john.doe@example.com',
          debtAmount: 100,
          debtDueDate: '2023-12-31',
        }),
      } as FileRow;

      jest.spyOn(debtsRepository, 'findOne').mockResolvedValue(null);

      await service.processRow(mockFileRow);

      expect(fileRowRepository.update).toHaveBeenCalledWith(
        { id: mockFileRow.id },
        {
          status: FileRowStatus.EXECUTING,
          response: '',
          updated_at: expect.any(Date),
        },
      );

      expect(debtsRepository.create).toHaveBeenCalledWith({
        debtId: uuid,
        name: 'John Doe',
        governmentId: '123456789',
        email: 'john.doe@example.com',
        debtAmount: 100,
        debtDueDate: '2023-12-31',
        invoiceGenerated: false,
      });

      expect(kafkaProducer.sendMessage).toHaveBeenCalled();

      expect(fileRowRepository.update).toHaveBeenCalledWith(
        { id: mockFileRow.id },
        {
          status: FileRowStatus.FINISH,
          response: '',
          updated_at: expect.any(Date),
        },
      );
    });

    it('should throw an error if debt already exists', async () => {
      const mockFileRow = {
        id: 1,
        row: JSON.stringify({
          debtId: '123',
          name: 'John Doe',
          governmentId: '123456789',
          email: 'john.doe@example.com',
          debtAmount: 100,
          debtDueDate: '2023-12-31',
        }),
      } as FileRow;

      const mockDebt = {
        debtId: '123',
        name: 'John Doe',
        governmentId: '123456789',
        email: 'john.doe@example.com',
        debtAmount: 100,
        debtDueDate: '2023-12-31',
        invoiceGenerated: false,
      } as unknown as Debts;

      jest.spyOn(debtsRepository, 'findOne').mockResolvedValue(mockDebt);

      await service.processRow(mockFileRow);

      expect(fileRowRepository.update).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if row data is invalid', async () => {
      const mockFileRow = {
        id: 1,
        row: 'invalid-json',
      } as FileRow;

      await service.processRow(mockFileRow);

      expect(fileRowRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if validation fails', async () => {
      const mockFileRow = {
        id: 1,
        row: JSON.stringify({
          debtId: '',
          name: 'John Doe',
          governmentId: '123456789',
          email: 'john.doe@example.com',
          debtAmount: 100,
          debtDueDate: '2023-12-31',
        }),
      } as FileRow;

      await service.processRow(mockFileRow);

      expect(fileRowRepository.update).toHaveBeenCalledWith(
        { id: mockFileRow.id },
        {
          status: FileRowStatus.ERROR,
          response: expect.stringContaining('Validation failed'),
          updated_at: expect.any(Date),
        },
      );
    });
  });
});
