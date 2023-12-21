import {
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    Body,
    UnauthorizedException,
    BadRequestException,
    HttpStatus,
    Query,
    HttpException,
   } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { JwtAuthGuard } from './guards/jwt.auth.guard';
  import { ResetPasswordDto } from './reset/reset-password.dto';
  import { ResetPasswordConfirmDto } from './reset/reset-confirm-password.dto';
  import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
  import { LoginDto } from './dto/Login.dto';

  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
  @Post('login')
  @ApiOperation({ summary: 'Login to the application' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully logged in',
    // Добавляем пример успешного ответа
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid login credentials' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);
      // Возвращаем успешный ответ с токенами
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      // Обрабатываем ошибку и возвращаем соответствующий HTTP-статус
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Invalid login credentials' },
        HttpStatus.BAD_REQUEST,
      );
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

  @ApiOperation({ summary: 'Activate Account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account activated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid activation token' })
  @Get('activate-account')
  async activateAccount(@Query('token') token: string): Promise<{ message: string }> {
    try {
      await this.authService.activateAccount(token);
      return { message: 'Account activated successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid activation token');
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
  