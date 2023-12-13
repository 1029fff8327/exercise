import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationService } from './activation/activation.service';
import { ActivationController } from './activation/activation.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
      UserModule,
      AuthModule,
      ConfigModule.forRoot({ isGlobal: true}),
      TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'root',
        database: process.env.POSTGRES_DB || 'program',
        port: Number.parseInt(process.env.DB_PORT, 10),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
      }),
      inject: [ConfigService]
  }), 
        MailerModule.forRoot({
          transport: {
            host: 'smtp.example.com', // Адрес SMTP-сервера
            port: 587, // Порт SMTP-сервера
            secure: false, // true для использования SSL, false для TLS
            auth: {
              user: 'your_username', // Имя пользователя
              pass: 'your_password', // Пароль
            },
          },
          defaults: {
            from: '"No Reply" <noreply@example.com>', // Адрес, от которого будут отправляться письма
          },
      })  
],
  controllers: [ActivationController],
  providers: [ActivationService],
})
export class AppModule {}
