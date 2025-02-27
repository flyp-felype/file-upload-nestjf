import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider } from './interface/email.interface';

@Injectable()
export class EmailProvider implements IEmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  sendEmail(params: { to: string; subject: string; body: string }): boolean {
    // Simula o envio de e-mail
    this.logger.log(`Simulando envio de e-mail para: ${params.to}`);
    this.logger.log(`Assunto: ${params.subject}`);
    this.logger.log(`Corpo: ${params.body}`);

    // Simula um sucesso no envio (retorna true)
    return true;
  }
}
