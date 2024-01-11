import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PostgresConfig } from './config/typeorm.config';
import { ConfigModule } from './config/config.module';
import { RedisConfig } from './config/redis.config';
import { JwtConfig } from './config/jwt.config';
import { RedisClientModule } from './global/redis-client/redis.client.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfig,
      inject: [PostgresConfig],
    }),
    JwtModule.registerAsync({
      useClass: JwtConfig,
      inject: [ConfigModule],
    }),
    UserModule,
    RedisClientModule.forRootAsync({
      useClass: RedisConfig,
    }),
    AuthModule,
    MailModule,
  ],
  controllers: [],
})
export class AppModule {}
