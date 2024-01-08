import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PostgresConfig } from './config/typeorm.config';
import { ConfigModule } from './config/config.module';
import { RedisConfig } from './config/redis.config';
import { JwtConfig } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: PostgresConfig,
      inject: [PostgresConfig],
    }),

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: RedisConfig,
      inject: [RedisConfig],
    }),
    JwtModule.registerAsync({
      useExisting: JwtConfig,
      inject: [ConfigModule]
    }),
    UserModule,
    AuthModule,
    MailModule,
  ],
  controllers: [],
})
export class AppModule {}