import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FileRow } from './fileRow.entity';

export enum FileMetadataStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  ERROR = 'ERROR',
  FINISH = 'FINISH',
}

@Entity('file_metadata')
export class FileMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  file_name: string;

  @Column({ type: 'char', length: 30, nullable: false })
  file_type: string;

  @Column({
    type: 'enum',
    enum: FileMetadataStatus,
    nullable: false,
    default: FileMetadataStatus.PENDING,
  })
  status: string;

  @Column({ type: 'int', nullable: true })
  total_register: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => FileRow, (fileRow) => fileRow.fileMetadata, {
    cascade: true,
  })
  fileRows: FileRow[];
}
