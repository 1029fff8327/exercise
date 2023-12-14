import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true для 465, false для других портов
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
      console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
