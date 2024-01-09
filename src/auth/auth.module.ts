import { Module, forwardRef } from '@nestjs/common';
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
import { RedisClientService } from 'src/global/redis-client/redis.client.service';
import { RedisClientModule } from 'src/global/redis-client/redis.client.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION_TIME'), },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    RedisClientModule,
   ],
  controllers: [AuthController],
  providers: [AuthService, LocalStratege, JwtStrategy, MailService, UserService, UserRepository, RedisClientService],
  exports: [AuthService]
})

export class AuthModule {}