import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducer } from './kafka.producer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'csv-processor',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'csv-group', // Todos os consumers fazem parte deste grupo
          },
        },
      },
    ]),
  ],
  controllers: [], // Registra múltiplos consumers
  providers: [KafkaProducer],
  exports: [KafkaProducer],
})
export class KafkaModule {}
