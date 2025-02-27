import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import * as fs from 'fs';
import { parse } from 'fast-csv';
import { KafkaProducer } from 'src/infra/kafka/kafka.producer';
import { Readable } from 'stream';

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
      // Tamanho do chunk (1 MB por padrão)
      const CHUNK_SIZE = 1024 * 1024; // 1 MB
      const buffer = Buffer.alloc(CHUNK_SIZE);
      const fileDescriptor = fs.openSync(filePath, 'r');

      let bytesRead;
      let position = 0;
      let remainingData = '';

      // Lê o arquivo em chunks
      while (
        (bytesRead = fs.readSync(
          fileDescriptor,
          buffer,
          0,
          CHUNK_SIZE,
          position,
        )) > 0
      ) {
        position += bytesRead;

        const chunkData = remainingData + buffer.toString('utf8', 0, bytesRead);

        const stream = Readable.from([chunkData]);
        const csvStream = parse({ headers: true })
          .on('data', (row) => {
            this.kafkaProducer
              .sendMessage('process-csv-row', {
                row,
                fileMetadata: message.fileMetadata,
              })
              .catch((error) => {
                this.logger.error(
                  'Erro ao enviar mensagem para o Kafka:',
                  error,
                );
              });
          })
          .on('end', () => {
            this.logger.log('Chunk processado com sucesso.');
          })
          .on('error', (error) => {
            this.logger.error('Erro ao processar o CSV:', error);
          });

        stream.pipe(csvStream);

        // Verifica se há dados restantes (linha incompleta)
        const lastNewlineIndex = chunkData.lastIndexOf('\n');
        if (
          lastNewlineIndex !== -1 &&
          lastNewlineIndex < chunkData.length - 1
        ) {
          remainingData = chunkData.slice(lastNewlineIndex + 1);
        } else {
          remainingData = '';
        }
      }

      // Fecha o arquivo após a leitura
      fs.closeSync(fileDescriptor);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
