import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';  
import { MailService } from 'src/mail/mail.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';

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
    forwardRef(() => AuthModule),
    forwardRef(() => MailModule), 
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    MailService,
    AuthService
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
