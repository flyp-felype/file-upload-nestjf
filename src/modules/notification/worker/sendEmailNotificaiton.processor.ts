import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from 'src/config/redis.config';
import { SendEmailNotificationService } from '../services/sendEmailNotification.service';
import { Debts } from 'src/modules/debts/entities/debts.entity';

@Injectable()
export class SendEmailNotificationProcessor
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SendEmailNotificationProcessor.name);
  private worker: Worker;
  constructor(
    private readonly sendNotificationService: SendEmailNotificationService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'send-email-notification',
      async (job: Job<{ debts: Debts }>) => {
        this.logger.log('SendEmail:', job.data.debts);

        await this.sendNotificationService.handle(job.data.debts);
      },
      { connection: createRedisConnection() },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} processado com sucesso.`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} falhou:`, err);
    });
  }

  onModuleDestroy() {
    this.worker.close();
  }
}
