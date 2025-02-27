import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from './notification.consumer';
import { SendEmailNotificationService } from '../services/sendEmailNotification.service';

describe('NotificationConsumer', () => {
  let notificationConsumer: NotificationConsumer;
  let sendNotificationService: SendEmailNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: SendEmailNotificationService,
          useValue: {
            handle: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationConsumer =
      module.get<NotificationConsumer>(NotificationConsumer);
    sendNotificationService = module.get<SendEmailNotificationService>(
      SendEmailNotificationService,
    );
  });

  it('should be defined', () => {
    expect(notificationConsumer).toBeDefined();
  });

  describe('consume', () => {
    it('should log and call sendNotificationService.handle when message is provided', async () => {
      const message = { debts: [{ id: 1, amount: 100 }] };

      await notificationConsumer.consume(message);

      expect(sendNotificationService.handle).toHaveBeenCalledWith(
        message.debts,
      );
    });
  });
});
