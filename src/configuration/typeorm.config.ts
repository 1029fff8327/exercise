import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: String (process.env.POSTGRES_PASSWORD),
  database: process.env.POSTGRES_DB,
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['./src/migrations/*{.ts,.js}'],

  migrationsRun: false,
  migrationsTableName: 'migrations',
});