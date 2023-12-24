import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../user/user.model';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize the transporter in the constructor
    this.transporter = nodemailer.createTransport({
      service: 'your-mail-service-provider', // e.g., 'gmail'
      auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password',
      },
    });
  }

  async sendActivationEmail(data: { email: string, activationToken: string }): Promise<void> {
    const activationLink = `http://your-frontend-url/activate-account?token=${data.activationToken}`;
    const subject = 'Activation Email';
    const text = `Click the following link to activate your account: ${activationLink}`;
  
    const email = data.email;

    const mailOptions = {
      from: 'your-email@example.com', // Set your email address
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
      from: 'your-email@example.com',
      to,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
