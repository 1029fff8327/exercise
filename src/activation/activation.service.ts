import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActivationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendActivationEmail(email: string): Promise<string> {
    const activationToken = uuidv4(); 

    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Activation',
      template: 'activation-email',
      context: {
        activationToken,
      },
    });

    return activationToken;
  }

  async activateAccount(email: string, activationToken: string): Promise<boolean> {

    return true;
  }
}
