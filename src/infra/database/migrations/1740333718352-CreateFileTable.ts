import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileTable1740333718352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    debtId UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    governmentId VARCHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL,
    debtAmount DECIMAL(10, 2) NOT NULL,
    debtDueDate DATE NOT NULL,
    invoiceGenerated BOOLEAN DEFAULT FALSE NOT NULL,
    barcode varchar(255),
    "sendNotification" BOOLEAN default false not null
);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS debts');
  }
}
