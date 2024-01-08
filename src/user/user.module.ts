import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';  
import { UserRepository } from 'src/repository/user.repository';
import { RedisClientService } from 'src/global/redis-client/redis.client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
   
    MailModule, 
    ConfigModule,
  ],
  controllers: [],
  providers: [
    RedisClientService,
    UserRepository,
    UserService,
    JwtService,
  ],
  exports: [UserService, TypeOrmModule, RedisClientService],
})
export class UserModule {}
