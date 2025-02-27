import { Controller, Logger } from '@nestjs/common';

import { SendEmailNotificationService } from '../services/sendEmailNotification.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationConsumer {
  protected readonly logger = new Logger(NotificationConsumer.name);
  constructor(
    private readonly sendNotificationService: SendEmailNotificationService,
  ) {}
  @MessagePattern('send-email-notification')
  async consume(@Payload() message: any) {
    try {
      if (!message) {
        throw new Error('Messagem do kafka indisponívle');
      }

      this.logger.log(`Processando o débito: ${JSON.stringify(message)}`);

      await this.sendNotificationService.handle(message.debts);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
