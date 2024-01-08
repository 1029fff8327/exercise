import { RedisModuleOptions, RedisOptionsFactory } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

  
  interface CustomRedisModuleOptions extends RedisModuleOptions {
    host: string;
    port: number;
    password: string;
  }
  
  @Injectable()
  export class RedisConfig implements RedisOptionsFactory {
    private readonly host: string;
    private readonly port: number;
    private readonly password: string;
  
    constructor(configService: ConfigService) {
      this.host = configService.get('REDIS_HOST');
      this.port = configService.get('REDIS_PORT');
      this.password = configService.get('REDIS_PASSWORD');
    }
  
    createRedisOptions(connectionName?: string): CustomRedisModuleOptions | Promise<CustomRedisModuleOptions> {
      return {
        host: this.host,
        port: this.port,
        password: this.password,
        
      };
    }
  }