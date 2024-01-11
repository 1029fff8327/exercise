import { Global, Module } from '@nestjs/common';
import { ConfigModule as CfgModule, ConfigService } from '@nestjs/config';
import { PostgresConfig } from './typeorm.config';
import { RedisConfig } from './redis.config';
import { JwtConfig } from './jwt.config';

@Global()
@Module({
  imports: [
    CfgModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
  providers: [JwtConfig, RedisConfig, PostgresConfig, ConfigService],
  exports: [JwtConfig, RedisConfig, PostgresConfig, ConfigService],
})
export class ConfigModule {}
