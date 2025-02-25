import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FileMetadata } from './fileMetadata.entity';

export enum FileRowStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  ERROR = 'ERROR',
  FINISH = 'FINISH',
}

@Entity('file_row')
export class FileRow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FileMetadata, (fileMetadata) => fileMetadata.fileRows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_metadata_id' })
  fileMetadata: FileMetadata;

  @Column({ type: 'text', nullable: false })
  row: string;

  @Column({
    type: 'enum',
    enum: FileRowStatus,
    nullable: false,
    default: FileRowStatus.PENDING,
  })
  status: FileRowStatus;

  @Column({ type: 'text', nullable: true })
  response: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
