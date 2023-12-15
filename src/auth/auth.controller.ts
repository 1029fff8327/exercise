import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
 } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.auth.guards';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { ResetPasswordDto } from './reset/reset-password.dto';
import { ResetPasswordConfirmDto } from './reset/reset-confirm-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.login(req.user)
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Post('reset-password')
  async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.authService.requestPasswordReset(resetPasswordDto.email);
  }

  @Post('reset-password-confirm')
  async resetPassword(@Body() resetPasswordConfirmDto: ResetPasswordConfirmDto): Promise<void> {
    await this.authService.resetPassword(resetPasswordConfirmDto.resetToken, resetPasswordConfirmDto.newPassword);
  }
}