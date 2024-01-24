import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class PostgresConfig implements TypeOrmOptionsFactory {
  private readonly host: string;
  private readonly port: number;
  private readonly username: string;
  private readonly password: string;
  private readonly database: string;

  constructor(private readonly configService: ConfigService) {
    this.host = configService.get('POSTGRES_HOST');
    this.port = configService.get('POSTGRES_PORT');
    this.username = configService.get('POSTGRES_USER');
    this.password = configService.get('POSTGRES_PASSWORD');
    this.database = configService.get('POSTGRES_DB');
  }

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
      entities: [User, Post],
      synchronize: true,
      logging: true,
    };
  }
}
