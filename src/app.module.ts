import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DebtsModule } from './modules/debts/debts.module';
import { FileModule } from './modules/file/file.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ProvidersModule } from './infra/provider/providers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './infra/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT || 5432),
      username: process.env.DATABASE_USER || 'userFile',
      password: process.env.DATABASE_PASSWORD || 'passFile',
      database: process.env.DATABASE_NAME || 'file_processing',
      migrations: [__dirname + '/../infra/database/migrations/*.{.ts,.js}'],
      migrationsTableName: 'migrations',
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScheduleModule.forRoot(),
    DebtsModule,
    FileModule,
    ProvidersModule,
    NotificationModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
