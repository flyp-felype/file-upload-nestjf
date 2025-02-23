import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debts } from './entities/debts.entity';
import { CsvProcessorService } from './queues/csv.processor';
import { ProcessRowService } from './services/processRow.service';
import { FileController } from './controller/file.controller';
import { FileService } from './services/file.service';
import { BullMQModule } from 'src/infra/bull/bull.module';

@Module({
  imports: [TypeOrmModule.forFeature([Debts]), BullMQModule],
  providers: [CsvProcessorService, ProcessRowService, FileService],
  controllers: [FileController],
  exports: [TypeOrmModule],
})
export class DebtsModule {}
