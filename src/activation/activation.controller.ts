import { Controller, Post, Body } from '@nestjs/common';
import { ActivationService } from './activation.service';

@Controller('activation')
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @Post('send-email')
  async sendActivationEmail(
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ): Promise<{ message: string }> {
    await this.activationService.sendActivationEmail(email, subject, text);

    return { message: 'Activation email sent successfully' };
  }

  @Post('activate')
  async activateAccount(
    @Body('email') email: string,
    @Body('activationToken') activationToken: string,
  ): Promise<{ message: string }> {
    const success = await this.activationService.activateAccount(email, activationToken);

    if (success) {
      return { message: 'Account activated successfully' };
    } else {
      return { message: 'Invalid activation token or user not found' };
    }
  }
}