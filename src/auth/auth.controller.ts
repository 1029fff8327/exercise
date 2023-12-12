import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  ValidationPipe,
  Patch
 } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.auth.guards';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; 
import { AuthGuard } from '@nestjs/passport';

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

  @Post('/forgotPassword')
  async forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto): Promise<void> {

  }

  @Patch('/chengePassword')
  @UseGuards(AuthGuard())
  async chengePassword() {
    
  }
}
