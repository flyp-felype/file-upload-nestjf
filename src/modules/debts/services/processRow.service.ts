import { Injectable, Logger } from '@nestjs/common';
import { FileDto } from '../dto/file-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debts } from '../entities/debts.entity';
@Injectable()
export class ProcessRowService {
  private readonly logger = new Logger(ProcessRowService.name);

  constructor(
    @InjectRepository(Debts)
    private debtsRepository: Repository<Debts>,
  ) {}

  async processRow(row: FileDto) {
    try {
      const debit = await this.debtsRepository.findOne({
        where: { debtId: row.debtId.trim() },
      });
      if (!debit) {
        const debits = this.debtsRepository.create({
          debtId: row.debtId.trim(),
          name: row.name.trim(),
          governmentId: row.governmentId.trim(),
          email: row.email.trim(),
          debtAmount: row.debtAmount,
          debtDueDate: row.debtDueDate,
          invoiceGenerated: false,
        });

        await this.debtsRepository.save(debits);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
