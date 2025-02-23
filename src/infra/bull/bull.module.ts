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
        return new Queue('csv-processing', {
          connection: createRedisConnection(),
        });
      },
    },
    {
      provide: 'INVOICE_GENERATE',
      useFactory: () =>
        new Queue('invoice-generate', { connection: createRedisConnection() }),
    },
  ],
  exports: ['CSV_QUEUE', 'INVOICE_GENERATE'],
})
export class BullMQModule {}
