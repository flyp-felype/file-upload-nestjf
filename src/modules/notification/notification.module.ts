import { Module } from '@nestjs/common';
import { SendEmailNotificationService } from './services/sendEmailNotification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debts } from '../debts/entities/debts.entity';
import { ProvidersModule } from 'src/infra/provider/providers.module';
import { NotificationConsumer } from './consumers/notification.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Debts]), ProvidersModule],
  providers: [SendEmailNotificationService],
  controllers: [NotificationConsumer],
  exports: [],
})
export class NotificationModule {}
