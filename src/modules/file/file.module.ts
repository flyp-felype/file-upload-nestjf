import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controller/file.controller';
import { FileService } from '../file/services/file.service';
import { BullMQModule } from 'src/infra/bull/bull.module';
import { CsvProcessorRowService } from '../file/worker/csvRow.processor';
import { FileMetadata } from './entities/fileMetadata.entity';
import { FileRow } from '../file/entities/fileRow.entity';
import { CronService } from './services/cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileMetadata, FileRow]), BullMQModule],
  providers: [FileService, CsvProcessorRowService, CronService],
  controllers: [FileController],
  exports: [TypeOrmModule],
})
export class FileModule {}
