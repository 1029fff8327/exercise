import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';  

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
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
