import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStratege } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/repository/user.repository';
import { RedisClientModule } from 'src/global/redis-client/redis.client.module'; 
import { RedisConfig } from 'src/config/redis.config';
import { JwtConfig } from 'src/config/jwt.config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfig, 
      inject: [ConfigModule],
    }),
    ConfigModule,
    RedisClientModule.forRootAsync({
      useClass: RedisConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStratege,
    JwtStrategy,
    MailService,
    UserService,
    UserRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}