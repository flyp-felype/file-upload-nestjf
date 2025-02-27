import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceConsumer } from './invoice.consumer';
import { InvoiceService } from '../services/invoice.service';
import { Logger } from '@nestjs/common';

describe('InvoiceConsumer', () => {
  let invoiceConsumer: InvoiceConsumer;
  let invoiceService: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceConsumer,
        {
          provide: InvoiceService,
          useValue: {
            handle: jest.fn(),
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

    invoiceConsumer = module.get<InvoiceConsumer>(InvoiceConsumer);
    invoiceService = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(invoiceConsumer).toBeDefined();
  });

  describe('consume', () => {
    it('should log and call invoiceService.handle when message is provided', async () => {
      const message = { debtId: '123' };

      await invoiceConsumer.consume(message);

      expect(invoiceService.handle).toHaveBeenCalledWith(message.debtId);
    });
  });
});
