import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfigService {
  constructor(private readonly configService: ConfigService) {}

  public getTransportGmail() {
    return this.createMailerOptions('gmail');
  }

  private createMailerOptions(type: string) {
    if (type === 'gmail') {
      return {
        transport: {
          service: 'gmail',
          host: this.configService.get<string>('EMAIL_HOST'),
          port: this.configService.get<number>('EMAIL_PORT'),
          auth: {
            user: this.configService.get<string>('EMAIL_USERNAME'),
            pass: this.configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: this.configService.get<string>('EMAIL_FROM'),
        },
        template: {
          dir: __dirname + '../../../../../core/mail/templates',
          options: {
            strict: true,
          },
        },
      };
    } 
  }
}