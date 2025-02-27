import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debts } from '../entities/debts.entity';
import { BoletoProvider } from '../../../infra/provider/boletos/bancoBrasil/boleto.provider';
import * as moment from 'moment';
import { KafkaProducer } from '../../../infra/kafka/kafka.producer';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Debts)
    private readonly debtsRepository: Repository<Debts>,
    private readonly boletoProvider: BoletoProvider,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async handle(debtId: string): Promise<void> {
    try {
      const debit = await this.findDebtById(debtId);
      this.validateDebt(debit);
      const boleto = await this.generateBoleto(debit);
      await this.updateDebt(debit.id, boleto.barcode);
      this.sendNotification(debit);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  private sendNotification(debts: Debts) {
    this.kafkaProducer
      .sendMessage('send-email-notification', {
        debts,
      })
      .catch((error) => {
        this.logger.error('Erro ao enviar mensagem para o Kafka:', error);
      });
  }

  private async findDebtById(debtId: string): Promise<Debts> {
    const debit = await this.debtsRepository.findOne({
      where: { debtId: debtId },
    });

    if (!debit) {
      throw new Error(`Debt not found: ${debtId}`);
    }

    return debit;
  }

  private validateDebt(debit: Debts): void {
    if (debit.invoiceGenerated) {
      throw new Error(`Invoice already generated: ${debit.debtId}`);
    }
  }

  private async generateBoleto(debit: Debts): Promise<{ barcode: string }> {
    const boleto = await this.boletoProvider.generateBoleto({
      amount: debit.debtAmount,
      payerName: debit.name,
      payerDocument: debit.governmentId,
      dueDate: moment(debit.debtDueDate).toDate(),
    });

    if (!boleto) {
      throw new Error(
        `There was an error generating the invoice: ${debit.debtId}`,
      );
    }

    return boleto;
  }

  private async updateDebt(debtId: number, barcode: string): Promise<void> {
    await this.debtsRepository.update(
      { id: debtId },
      { invoiceGenerated: true, barcode: barcode },
    );
  }
}
