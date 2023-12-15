import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-password',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'your-email@gmail.com',
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
