import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './mailer.config';

@Module({
  imports: [MailerModule.forRoot(mailerConfig)],
  exports: [MailerModule],
})
export class MailerConfigModule {}