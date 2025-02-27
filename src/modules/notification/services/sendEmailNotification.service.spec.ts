import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Debts } from '../../debts/entities/debts.entity';
import { EmailProvider } from '../../../infra/provider/email/email.provider';
import { SendEmailNotificationService } from './sendEmailNotification.service';

describe('SendEmailNotificationService', () => {
  let service: SendEmailNotificationService;
  let debtsRepository: Repository<Debts>;
  let emailProvider: EmailProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailNotificationService,
        {
          provide: 'DebtsRepository',
          useValue: {
            findOneBy: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: EmailProvider,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SendEmailNotificationService>(
      SendEmailNotificationService,
    );
    debtsRepository = module.get<Repository<Debts>>('DebtsRepository');
    emailProvider = module.get<EmailProvider>(EmailProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('should send an email and update the debt', async () => {
      const mockDebt = {
        id: 1,
        email: 'john.doe@example.com',
        barcode: '123456789',
        sendNotification: false,
      } as Debts;

      // Mock do findOneBy para retornar a dívida
      jest.spyOn(debtsRepository, 'findOneBy').mockResolvedValue(mockDebt);

      // Mock do sendEmail para retornar true (e-mail enviado com sucesso)
      jest.spyOn(emailProvider, 'sendEmail').mockReturnValue(true);

      await service.handle(mockDebt);

      // Verifica se o e-mail foi enviado
      expect(emailProvider.sendEmail).toHaveBeenCalledWith({
        to: mockDebt.email,
        subject: 'Boleto Kanastra',
        body: `Segue  codigo de barra ${mockDebt.barcode}`,
      });

      expect(debtsRepository.update).toHaveBeenCalledWith(
        { id: mockDebt.id },
        { sendNotification: true },
      );
    });
  });
});
