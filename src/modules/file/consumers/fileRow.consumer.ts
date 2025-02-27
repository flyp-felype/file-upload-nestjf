import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import * as fs from 'fs';
import { parse } from 'fast-csv';
import { KafkaProducer } from 'src/infra/kafka/kafka.producer';

@Controller()
export class FileRowConsumer {
  protected readonly logger = new Logger(FileRowConsumer.name);
  constructor(private readonly kafkaProducer: KafkaProducer) {}
  @MessagePattern('file-ready-for-processing')
  consume(@Payload() message: any) {
    try {
      if (!message) {
        throw new Error('Messagem do kafka indisponívle');
      }

      this.logger.log(`Processando linha do CSV: ${JSON.stringify(message)}`);

      const filePath = message.filePath;
      const stream = fs.createReadStream(filePath);

      const csvStream = parse({ headers: true })
        .on('data', (row) => {
          this.kafkaProducer
            .sendMessage('process-csv-row', {
              row,
              fileMetadata: message.fileMetadata,
            })
            .catch((error) => {
              this.logger.error('Erro ao enviar mensagem para o Kafka:', error);
            });
        })
        .on('end', () => {
          this.logger.log('Processamento do CSV concluído.');
        })
        .on('error', (error) => {
          this.logger.error('Erro ao processar o CSV:', error);
        });

      stream.pipe(csvStream);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
