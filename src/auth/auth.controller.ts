import {
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    Body,
    UnauthorizedException,
    BadRequestException,
   } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { LocalAuthGuard } from './guards/local.auth.guards';
  import { JwtAuthGuard } from './guards/jwt.auth.guard';
  import { ResetPasswordDto } from './reset/reset-password.dto';
  import { ResetPasswordConfirmDto } from './reset/reset-confirm-password.dto';
  import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    
  @ApiOperation({ summary: 'Login' })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    try {
      const user = req.user; 

      const accessToken = await this.authService.generateAccessToken(user);

      const responseData = {
        id: user.id,
        email: user.email,
        accessToken,
        
      };

      return responseData;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  
  @ApiOperation({ summary: 'Get Profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    try {
      const user = req.user;

      const profileData = {
        id: user.id,
        email: user.email,
      };

      return profileData;
    } catch (error) {
      throw new UnauthorizedException('Failed to retrieve profile');
    }
  }
    
  @ApiOperation({ summary: 'Reset Password' })
  @Post('reset-password')
  async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      await this.authService.requestPasswordReset(resetPasswordDto.email);
      
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      
      throw new BadRequestException('Failed to request password reset');
    }
  }

  @ApiOperation({ summary: 'Reset Password Confirm' })
  @Post('reset-password-confirm')
  async resetPassword(@Body() resetPasswordConfirmDto: ResetPasswordConfirmDto): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(
        resetPasswordConfirmDto.resetToken,
        resetPasswordConfirmDto.newPassword,
      );
      
      return { message: 'Password reset successfully' };
    } catch (error) {
      
      throw new BadRequestException('Failed to reset password');
    }
  }
  }