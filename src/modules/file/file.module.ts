import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controller/file.controller';
import { FileService } from '../file/services/file.service';
import { FileMetadata } from './entities/fileMetadata.entity';
import { FileRow } from '../file/entities/fileRow.entity';
import { CronService } from './services/cron.service';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { ProcessCsvRowConsumer } from './consumers/processCsvRow.consumer';
import { UploadService } from './services/upload.service';
import { FileRowConsumer } from './consumers/fileRow.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileMetadata, FileRow]),
    forwardRef(() => KafkaModule),
  ],
  providers: [FileService, CronService, UploadService],
  controllers: [FileController, ProcessCsvRowConsumer, FileRowConsumer],
  exports: [TypeOrmModule],
})
export class FileModule {}
