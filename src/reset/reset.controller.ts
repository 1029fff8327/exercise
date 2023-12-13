import { Controller, Post, Body } from '@nestjs/common';
import { ResetPasswordService } from './reset.service'; 

@Controller('reset-password')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('request')
  async requestReset(@Body('email') email: string): Promise<{ message: string }> {
    const resetToken = await this.resetPasswordService.requestReset(email);

    if (resetToken) {
      return { message: 'Reset email sent successfully' };
    } else {
      return { message: 'User not found' };
    }
  }

  @Post('reset')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
    @Body('resetToken') resetToken: string,
  ): Promise<{ message: string }> {
    const success = await this.resetPasswordService.resetPassword(email, newPassword, resetToken);

    if (success) {
      return { message: 'Password reset successful' };
    } else {
      return { message: 'Invalid reset token or user not found' };
    }
  }
}
