import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import { MailConfigService } from './mail.config.service';

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);

  constructor(private readonly mailConfig: MailConfigService) {}

  async send(config): Promise<SentMessageInfo> {
    try {
      return await this.sendMail(config);
    } catch (error) {
      this._logger.error(error, error.stack);
      throw new InternalServerErrorException(error);
    }
  }

  async sendMail(config): Promise<SentMessageInfo> {
    try {
      const { transport, defaults } = this.mailConfig.getTransportGmail();
      const transporter = nodemailer.createTransport(transport, defaults);
      return transporter.sendMail(config);
    } catch (error) {
      console.error('Error sending email:', error);
      this._logger.error(error, error.stack);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  async sendActivationEmail(to: string, activationToken: string): Promise<void> {
    const subject = 'Активация учетной записи';
    const text = `Для активации вашей учетной записи перейдите по ссылке: http://your-frontend-url/activate-account?token=${activationToken}`;

    try {
      const { transport, defaults } = this.mailConfig.getTransportGmail();
      const transporter = nodemailer.createTransport(transport, defaults);

      await transporter.sendMail({
        from: 'your-email@gmail.com', // Update with your email
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Error sending activation email:', error);
      this._logger.error(error, error.stack);
      throw new InternalServerErrorException('Error sending activation email');
    }
  }
}