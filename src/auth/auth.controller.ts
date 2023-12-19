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
  import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, description: 'User logged in successfully', type: Object })
    @ApiOkResponse({ status: 400, description: 'Invalid credentials' })
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({
      description: 'Credentials for logging in',
      schema: {
        $ref: '#/components/schemas/LoginCredentials', 
      },
    })
    async login(
      @Request() req,
      @Body() credentials: { email: string; password: string }
    ): Promise<{ id: string; email: string; accessToken: string }> {
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOkResponse({ status: 200, description: 'User profile retrieved successfully', type: Object })
  async getProfile(@Request() req): Promise<{ id: string; email: string }> {
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
  @ApiOkResponse({ status: 200, description: 'Password reset email sent successfully', type: Object })
  @ApiBadRequestResponse({ status: 400, description: 'Failed to send password reset email' })
  @Post('reset-password')
  async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      await this.authService.requestPasswordReset(resetPasswordDto.email);

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  @ApiOperation({ summary: 'Reset Password Confirm' })
  @ApiOkResponse({ status: 200, description: 'Password reset successfully', type: Object })
  @ApiBadRequestResponse({ status: 400, description: 'Failed to reset password' })
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
  