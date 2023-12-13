import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActivationService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.example.com', // Адрес SMTP-сервера
      port: 587, // Порт SMTP-сервера
      secure: false, // true для использования SSL, false для TLS
      auth: {
        user: 'your_username', // Имя пользователя
        pass: 'your_password', // Пароль
      },
    });
  }

  async sendActivationEmail(email: string, subject: string, text: string): Promise<string> {
    const activationToken = uuidv4(); // Генерация уникального токена

    // Сохранение токена активации в базе данных или кэше
    // Вам может понадобиться создать отдельную сущность/модель для токенов активации

    // Отправка электронного письма с токеном активации
    const info = await this.transporter.sendMail({
      from: '"No Reply" <noreply@example.com>', // Адрес, от которого будут отправляться письма
      to: email,
      subject: subject,
      text: text,
    });

    console.log('Message sent: %s', info.messageId);

    return activationToken;
  }

  async activateAccount(email: string, activationToken: string): Promise<boolean> {
    // Проверка токена активации и активация аккаунта в базе данных или кэше
    // Возвращение true, если активация прошла успешно

    return true;
  }
}