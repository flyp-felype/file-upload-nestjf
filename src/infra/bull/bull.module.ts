import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Queue } from 'bullmq';
import { createRedisConnection } from 'src/config/redis.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CSV_QUEUE',
      useFactory: () => {
        return new Queue('debits-processing', {
          connection: createRedisConnection(),
        });
      },
    },
    {
      provide: 'INVOICE_GENERATE',
      useFactory: () =>
        new Queue('invoice-generate', { connection: createRedisConnection() }),
    },
    {
      provide: 'PROCESS_CSV_ROW',
      useFactory: () =>
        new Queue('process-csv-row', { connection: createRedisConnection() }),
    },
    {
      provide: 'SEND_EMAIL_NOTIFICATION',
      useFactory: () =>
        new Queue('send-email-notification', {
          connection: createRedisConnection(),
        }),
    },
  ],
  exports: [
    'CSV_QUEUE',
    'INVOICE_GENERATE',
    'PROCESS_CSV_ROW',
    'SEND_EMAIL_NOTIFICATION',
  ],
})
export class BullMQModule {}
