import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, KafkaMessage, Consumer } from 'kafkajs';

export abstract class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  protected abstract topic: string;
  protected abstract groupId: string;
  protected consumer: Consumer;
  protected readonly logger = new Logger(KafkaConsumer.name);
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'file-processor',
      brokers: ['localhost:9092'], // Ajuste conforme necessário
    });
  }

  abstract handleMessage(message: KafkaMessage): Promise<void>;

  async onModuleInit() {
    try {
      // Agora as propriedades `topic` e `groupId` já estarão disponíveis
      this.consumer = this.kafka.consumer({ groupId: this.groupId });

      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.topic,
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            await this.handleMessage(message);
          } catch (error) {
            this.logger.error(
              `Erro ao processar mensagem do tópico ${this.topic}:`,
              error,
            );
          }
        },
      });

      this.logger.log(`Consumer para o tópico ${this.topic} iniciado.`);
    } catch (error) {
      this.logger.error(
        `Erro ao iniciar o consumer do tópico ${this.topic}:`,
        error,
      );
    }
  }

  async onModuleDestroy() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        this.logger.log(`Consumer para o tópico ${this.topic} desconectado.`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao desconectar o consumer do tópico ${this.topic}:`,
        error,
      );
    }
  }
}
