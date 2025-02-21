```
src/
├── domain/
│   ├── entities/
│   │   ├── boleto.entity.ts
│   │   ├── debito.entity.ts
│   │   └── cliente.entity.ts
│   └── repositories/
│       └── boleto.repository.interface.ts
│
├── application/
│   ├── use-cases/
│   │   ├── processar-arquivo-csv.usecase.ts
│   │   ├── gerar-boleto.usecase.ts
│   │   └── enviar-email.usecase.ts
│   └── dtos/
│       └── processar-arquivo.dto.ts
│
├── infrastructure/
│   ├── repositories/
│   │   └── boleto.repository.ts
│   ├── services/
│   │   ├── email.service.ts         // Implementação do envio de e-mails
│   │   └── boleto.service.ts         // Lógica concreta de geração de boletos
│   └── queues/
│       └── billing.processor.ts      // Processador da fila para o processamento dos arquivos
│
├── interfaces/
│   ├── controllers/
│   │   └── billing.controller.ts     // Endpoint para upload e disparo dos casos de uso
│   └── mappers/
│       └── csv.mapper.ts             // Mapeamento dos dados CSV para DTOs/domínio
│
├── config/
│   └── app.config.ts                 // Configurações da aplicação
│
└── main.ts                           // Inicialização do NestJS

```