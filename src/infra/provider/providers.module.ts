import { Module } from '@nestjs/common';
import { BoletoProvider } from './boletos/bancoBrasil/boleto.provider';
import { EmailProvider } from './email/email.provider';

@Module({
  providers: [BoletoProvider, EmailProvider],
  exports: [BoletoProvider, EmailProvider],
})
export class ProvidersModule {}
