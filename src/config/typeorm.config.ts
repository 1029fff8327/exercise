import { User } from '../user/user.model';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostgresConfig implements TypeOrmOptionsFactory {
    private readonly type: string;
    private readonly host: string;
    private readonly port: number;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;

    constructor(configService: ConfigService) {
        this.type = 'postgres'; 
        this.host = configService.get('POSTGRES_HOST');
        this.port = configService.get('POSTGRES_PORT');
        this.username = configService.get('POSTGRES_USER');
        this.password = configService.get('POSTGRES_PASSWORD');
        this.database = configService.get('POSTGRES_DB');
    }

    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
            database: this.database,
            entities: [User], 
            synchronize: false, 
            driver: {
              type: 'postgres', 
          },
        };
    }
}