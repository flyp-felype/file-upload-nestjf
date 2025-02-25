import { Module } from '@nestjs/common';
import { SendEmailNotificationProcessor } from './worker/sendEmailNotificaiton.processor';
import { SendEmailNotificationService } from './services/sendEmailNotification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debts } from '../debts/entities/debts.entity';
import { ProvidersModule } from 'src/infra/provider/providers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Debts]), ProvidersModule],
  providers: [SendEmailNotificationProcessor, SendEmailNotificationService],
  exports: [],
})
export class NotificationModule {}
