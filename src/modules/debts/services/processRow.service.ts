import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debts } from '../entities/debts.entity';
import { Queue } from 'bullmq';
import { FileRow, FileRowStatus } from '../../file/entities/fileRow.entity';
import { FileDto } from '../../file/dto/file-request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ProcessRowService {
  private readonly logger = new Logger(ProcessRowService.name);

  constructor(
    @InjectRepository(Debts)
    private readonly debtsRepository: Repository<Debts>,

    @InjectRepository(FileRow)
    private readonly fileRowRepository: Repository<FileRow>,

    @Inject('INVOICE_GENERATE')
    private readonly queue: Queue,
  ) {}

  async processRow(fileRow: FileRow): Promise<void> {
    try {
      const row = this.parseFileRow(fileRow.row);
      await this.updateFileRowStatus(fileRow.id, FileRowStatus.EXECUTING);

      await this.validateRow(row, fileRow.id);

      const existingDebt = await this.debtsRepository.findOne({
        where: { debtId: row.debtId.trim() },
      });

      if (existingDebt) {
        throw new Error(
          `There is already a debt with this uuid ${row.debtId.trim()}`,
        );
      }
      await this.createDebtAndQueue(row);

      await this.updateFileRowStatus(fileRow.id, FileRowStatus.FINISH);
    } catch (error) {
      await this.updateFileRowStatus(
        fileRow.id,
        FileRowStatus.ERROR,
        String(error),
      );
    }
  }

  private parseFileRow(rowData: string): FileDto {
    try {
      const rowObject = JSON.parse(rowData);
      rowObject.debtAmount = Number(rowObject.debtAmount);
      rowObject.debtId = rowObject.debtId.trim();
      return plainToInstance(FileDto, rowObject);
    } catch (error) {
      throw new Error(`Invalid JSON forma ${error}`);
    }
  }

  private async validateRow(row: FileDto, fileRowId: number): Promise<void> {
    const errors = await validate(row);
    if (errors.length > 0) {
      this.logger.error(`Validation failed: ${JSON.stringify(errors)}`);
      await this.updateFileRowStatus(
        fileRowId,
        FileRowStatus.ERROR,
        JSON.stringify(errors),
      );
      throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }
  }

  private async createDebtAndQueue(row: FileDto): Promise<void> {
    console.log('ROOOWW ', row);
    const newDebt = this.debtsRepository.create({
      debtId: row.debtId.trim(),
      name: row.name.trim(),
      governmentId: row.governmentId.trim(),
      email: row.email.trim(),
      debtAmount: row.debtAmount,
      debtDueDate: row.debtDueDate,
      invoiceGenerated: false,
    });

    await this.debtsRepository.save(newDebt);

    await this.queue
      .add('invoice-generate', { debtId: newDebt.debtId })
      .catch((error) => {
        this.logger.error('Error adding to queue:', error);
      });
  }

  private async updateFileRowStatus(
    id: number,
    status: FileRowStatus,
    response?: string,
  ): Promise<void> {
    await this.fileRowRepository.update(
      { id },
      {
        status,
        response: response || '',
        updated_at: new Date(),
      },
    );
  }
}
