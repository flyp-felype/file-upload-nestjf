import { Injectable } from '@nestjs/common';
import { IEmailProvider } from './interface/email.interface';

@Injectable()
export class EmailProvider implements IEmailProvider {
  sendEmail(params: { to: string; subject: string; body: string }): boolean {
    // Simula o envio de e-mail
    console.log(`Simulando envio de e-mail para: ${params.to}`);
    console.log(`Assunto: ${params.subject}`);
    console.log(`Corpo: ${params.body}`);

    // Simula um sucesso no envio (retorna true)
    return true;
  }
}
