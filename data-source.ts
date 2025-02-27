import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'userFile',
  password: process.env.DATABASE_PASSWORD || 'passFile',
  database: process.env.DATABASE_NAME || 'file_processing',
  migrations: ['dist/infra/database/migrations/*.js'],
  synchronize: false,
  logging: true,
});
