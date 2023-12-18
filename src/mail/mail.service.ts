import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'), 
      port: this.configService.get('SMTP_PORT'), 
      auth: {
        user: this.configService.get('SMTP_USER'), 
        password: this.configService.get('SMTP_PASSWORD'), 
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get('SMTP_USER'),
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Электронное письмо, отправленное по адресу ${to} с предметом: ${subject}`);
    } catch (error) {
      console.error("Ошибка отправки электронного письма:", error);
      throw error;
    }
  }

  async sendActivationEmail(to: string, token: string): Promise<void> {
    const activationLink = `http://your-frontend-url/?activation_key=${token}`;
    const subject = 'Активация учетной записи';
    const text = `Для активации вашей учетной записи перейдите по ссылке: ${activationLink}`;

    await this.sendMail(to, subject, text);
  }
}
