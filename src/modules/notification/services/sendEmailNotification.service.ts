import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailProvider } from '../../../infra/provider/email/email.provider';
import { Debts } from '../../debts/entities/debts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SendEmailNotificationService {
  private readonly logger = new Logger(SendEmailNotificationService.name);
  constructor(
    @InjectRepository(Debts)
    private readonly debtsRepository: Repository<Debts>,
    private readonly emailProvider: EmailProvider,
  ) {}

  async handle(debts: Debts) {
    try {
      const debt = await this.debtsRepository.findOneBy({ id: debts.id });
      if (!debt) throw new Error(`Not found debt ${debts.id}`);

      if (debt.sendNotification)
        throw new Error(`notification already sent  ${debts.id}`);

      const emailSent = this.emailProvider.sendEmail({
        to: debt.email,
        subject: 'Boleto Kanastra',
        body: `Segue  codigo de barra ${debt.barcode}`,
      });

      if (emailSent)
        await this.debtsRepository.update(
          { id: debt.id },
          { sendNotification: true },
        );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
