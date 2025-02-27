## Funcionamento do Sistema

1. *Upload do Arquivo:* O processo inicia com o upload do arquivo através de um endpoint. O arquivo é recebido e validado pelo servidor.

2. *Armazenamento Temporário:* Após a validação, o arquivo é armazenado temporariamente em um sistema de armazenamento local. Para maior escalabilidade e resiliência, pode-se integrar um serviço de armazenamento em nuvem, como Amazon S3, Google Cloud Storage ou Azure Blob Storage.

3. *Notificação via Kafka:* Uma vez que o arquivo é armazenado com sucesso, uma mensagem é publicada em um tópico do  Kafka.

4. *Processamento do Arquivo:* Um consumer do Kafka, responsável por processar o arquivo, é acionado. Este consumer realiza a leitura do arquivo, aplica as regras de negócio necessárias e envia os dados processados para uma fila de persistência.

5. *Agendamento de Tarefas (Cron Service):* Um serviço agendado (cron.service) é executado a cada 30 segundos para consultar o banco de dados em busca de registros com status *PENDING.* Esses registros são então selecionados para processamento do débito e boltos.

6. *Inserção na Tabela de Débitos e Geração de Boleto:* Os registros selecionados são inseridos em uma tabela específica para débitos. Após a inserção, uma nova mensagem é publicada em um tópico do Kafka dedicado à geração de boletos.

7. *Geração do Boleto:* Um consumer específico para a geração de boletos é acionado. Este consumer utiliza os dados recebidos para gerar o boleto bancário e, em seguida, publica uma mensagem em um tópico do Kafka dedicado à notificação.

8. *Notificação e Atualização de Status:* O consumer de notificação processa a mensagem, enviando o boleto gerado por e-mail ao destinatário. Após o envio bem-sucedido, o status do débito é atualizado para NOTIFIED, indicando que o processo de notificação foi concluído.

### Débito técnicos

1. Entendo que na geração de boleto podemos aplicar o designer patters de Factory com Strategy.

2. Por depender de sistemas externos para geração de cobrança usaria também um Adapter, assim integrar sistemas externos sem muita dor de cabeça.

## Pré-requisitos

Antes de começar, certifique-se de que você possui as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## Como Executar o Projeto

Siga os passos abaixo para clonar, configurar e executar o projeto:

### 1. Clonar o Repositório

Primeiro, clone o repositório para o seu ambiente local:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```
*O arquivo .env.example contem o exemplo de variaveis de ambientes necessária para o projeto rodar* 

### 2. Instalar Dependências

Após clonar o repositório, instale as dependências do projeto utilizando o npm:

```bash
npm install
```

### 3. Compilar o Projeto

Compile o projeto com o seguinte comando:

```bash
npm run build
```

### 4. Subir os Containers com Docker Compose

O projeto utiliza Docker para gerenciar os serviços necessários, como o banco de dados PostgreSQL e o Redis (usado pelo BullMQ para processamento de filas). Para subir os containers, execute:

```bash
docker-compose up -d
```

Este comando irá criar e iniciar os containers necessários, além de configurar o banco de dados com as tabelas descritas no arquivo _init.sql_.


### 5. Executar a Aplicação em Modo de Desenvolvimento

Com os containers em execução, inicie a aplicação em modo de desenvolvimento com o seguinte comando:


```bash
npm run start:dev
```

A aplicação estará rodando e pronta para receber requisições.

## Endpoints da API

### Envio de Arquivo CSV

O sistema possui um endpoint POST para receber arquivos CSV. Esse endpoint processa o arquivo, salva as linhas na tabela file_row e inicia o processamento assíncrono para gerar boletos e enviar notificações.

- Endpoint: POST /files/upload
- Body: FormData com o arquivo CSV.
- Exemplo de uso:

```curl
curl --request POST \
  --url 'http://localhost:3000/files/upload?=' \
  --header 'Content-Type: multipart/form-data' \
  --header 'User-Agent: insomnia/10.3.1' \
  --form file=@/input.csv
```
### Documentação da API com Swagger

A documentação da API está disponível através do Swagger. Após iniciar a aplicação, você pode acessar a documentação no seguinte endereço:

Swagger UI: http://localhost:3000/docs

## Estrutura do Banco de Dados

O banco de dados PostgreSQL é configurado automaticamente com as seguintes tabelas:

#### Tabela _debts_

Armazena as informações das dívidas, incluindo detalhes como nome, CPF, e-mail, valor da dívida, data de vencimento, e status de geração de boleto e notificação.

```sql
CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    "debtId" UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    "governmentId" VARCHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "debtAmount" DECIMAL(10, 2) NOT NULL,
    "debtDueDate" DATE NOT NULL,
    "invoiceGenerated" BOOLEAN DEFAULT FALSE NOT NULL,
    barcode varchar(255),
    "sendNotification" BOOLEAN default false not null
);
```

#### Tabela _file_metadata_

Armazena metadados sobre os arquivos processados, como nome, tipo, status, e quantidade de registros.

```sql
CREATE TABLE IF NOT EXISTS file_metadata (
    id serial primary key ,
    file_name varchar(255) not null,
    file_type char(30) not null,
    status varchar(100),
    total_register int,
    created_at timestamp default now(),
    updated_at timestamp default now()
);
```


#### Tabela _file_row_

Armazena as linhas processadas de cada arquivo, juntamente com o status e a resposta do processamento.

```sql
CREATE TABLE IF NOT EXISTS file_row (
    id serial primary key,
    file_metadata_id int not null references file_metadata(id) on delete cascade,
    row  text not null,
    status varchar(100),
    response text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);
```

