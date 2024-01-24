import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { MailService } from 'src/mail/services/mail.service';
import { UserService } from 'src/user/services/user.service';
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
    LocalStrategy,
    JwtStrategy,
    MailService,
    UserService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
