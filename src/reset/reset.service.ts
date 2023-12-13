import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service'; 
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly usersService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  async requestReset(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {

      return null;
    }

    const resetToken = uuidv4(); 
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'reset-password', 
      context: {
        resetToken,
      },
    });

    return resetToken;
  }

  async resetPassword(email: string, newPassword: string, resetToken: string): Promise<boolean> {

    return true;
  }
}