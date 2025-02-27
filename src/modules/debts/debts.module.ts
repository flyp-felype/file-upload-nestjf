import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debts } from './entities/debts.entity';
import { DebitsService } from './services/debits.service';
import { FileService } from '../file/services/file.service';
import { FileRow } from '../file/entities/fileRow.entity';
import { FileMetadata } from '../file/entities/fileMetadata.entity';
import { InvoiceService } from './services/invoice.service';
import { ProvidersModule } from 'src/infra/provider/providers.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { DebitsConsumer } from './consumers/debits.consumer';
import { InvoiceConsumer } from './consumers/invoice.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debts, FileRow, FileMetadata]),
    ProvidersModule,
    forwardRef(() => KafkaModule),
  ],
  providers: [DebitsService, FileService, InvoiceService],
  controllers: [DebitsConsumer, InvoiceConsumer],
  exports: [TypeOrmModule],
})
export class DebtsModule {}
