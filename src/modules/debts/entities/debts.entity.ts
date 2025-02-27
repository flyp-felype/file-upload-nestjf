import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('debts')
export class Debts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  debtId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 11 })
  governmentId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  debtAmount: number;

  @Column({ type: 'date' })
  debtDueDate: Date;

  @Column({ type: 'boolean', default: false })
  invoiceGenerated: boolean;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  barcode?: string;

  @Column({ type: 'boolean', default: false })
  sendNotification: boolean;
}
