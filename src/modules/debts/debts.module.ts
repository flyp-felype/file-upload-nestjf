import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debts } from './entities/debts.entity';
import { DebitsProcessorService } from './worker/debits.processor';
import { ProcessRowService } from './services/processRow.service';
import { FileService } from '../file/services/file.service';
import { BullMQModule } from 'src/infra/bull/bull.module';
import { CsvProcessorRowService } from '../file/worker/csvRow.processor';
import { DebitsService } from './services/debits.service';
import { FileRow } from '../file/entities/fileRow.entity';
import { FileMetadata } from '../file/entities/fileMetadata.entity';
import { InvoiceService } from './services/invoce.service';
import { InvoiceProcessorService } from './worker/invoce.processor';
import { ProvidersModule } from 'src/infra/provider/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debts, FileRow, FileMetadata]),
    BullMQModule,
    ProvidersModule,
  ],
  providers: [
    DebitsProcessorService,
    InvoiceProcessorService,
    ProcessRowService,
    FileService,
    CsvProcessorRowService,
    DebitsService,
    InvoiceService,
  ],
  controllers: [],
  exports: [TypeOrmModule],
})
export class DebtsModule {}
