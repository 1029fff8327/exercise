import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/user.entity';
import { ISendMailProps } from '../mail.entity';
import { MailMapper } from '../mappers/mail.mapper';

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
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendActivationEmail(data: {
    email: string;
    activationToken: string;
  }): Promise<void> {
    const mailProps: ISendMailProps = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: data.email,
      subject: 'Activation Email',
      text: `Click the following link to activate your account: http://your-frontend-url/activate-account?token=${data.activationToken}`,
    };

    await this.sendMail(mailProps);
  }

  async sendResetTokenEmail(user: User, resetToken: string): Promise<void> {
    const mailProps: ISendMailProps = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: user.email,
      subject: 'Password Reset',
      text: `To reset your password, follow the link: resetToken=${resetToken}`,
    };

    await this.sendMail(mailProps);
  }

  async sendMail(mailProps: ISendMailProps): Promise<void> {
    const completeMailProps = {
      from: this.configService.get<string>('EMAIL_FROM'),
      ...mailProps,
    };

    const mailOptions = MailMapper.buildMailPayload(completeMailProps);

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', mailProps.to);
    } catch (error) {
      console.error('Error sending email to:', mailProps.to);
      console.error('Error details:', error);
    }
  }
}
