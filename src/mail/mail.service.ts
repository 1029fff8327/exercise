import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../user/user.model';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USERNAME'),
        pass: this.configService.get<string>('EMAIL_PASSWORD')
      },
    });
  } 

  async sendActivationEmail(data: { email: string, activationToken: string }): Promise<void> {
    const activationLink = `http://your-frontend-url/activate-account?token=${data.activationToken}`;
    const subject = 'Activation Email';
    const text = `Click the following link to activate your account: ${activationLink}`;
  
    const email = data.email;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Activate Your Account',
      text: `Click the following link to activate your account: ${activationLink}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Activation email sent successfully.');
    } catch (error) {
      console.error('Error sending activation email:', error);
      // Handle the error, you might want to throw an exception or log it
    }
  }

  // Method to send reset token email
  async sendResetTokenEmail(user: User, resetToken: string): Promise<void> {
    const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`;
    const subject = 'Сброс пароля';
    const text = `Для сброса пароля перейдите по ссылке: ${resetLink}`;

    await this.sendMail(user.email, subject, text);
  }

  // Generic method to send mail
  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: to,
      subject: subject,
      text: text,
    };
  
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Error sending email to:', to);
      console.error('Error details:', error);
      // Handle the error, you might want to throw an exception or log it
    }
  }
}