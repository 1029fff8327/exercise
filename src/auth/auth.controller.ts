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
import { ActivateAccountDto } from './dto/activate-account.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    ) {}

@Post('login')
@ApiOperation({ summary: 'Войдите в приложение' })
@ApiResponse({ 
  status: HttpStatus.OK, 
  description: 'Пользователь успешно вошел в систему',
  
  schema: {
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      expiresIn: { type: 'number' },
    },
  },
})
@ApiBadRequestResponse({ description: 'Неверные учетные данные для входа в систему' })
async login(@Body() loginDto: LoginDto): Promise<any> {
  try {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      activationToken: result.activationToken,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    // Обрабатываем ошибку и возвращаем соответствующий HTTP-статус
    throw new HttpException(
      { status: HttpStatus.BAD_REQUEST, error: 'Неверные учетные данные для входа в систему' },
      HttpStatus.BAD_REQUEST,
    );
  }
}

@ApiOperation({ summary: 'Activate Account' })
@Post('activate-account')
@ApiOperation({ summary: 'Активировать учетную запись' })
@ApiResponse({ status: HttpStatus.OK, description: 'Учетная запись успешно активирована' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Недействительный токен активации' })
async activateAccount(@Body() activateAccountDto: ActivateAccountDto): Promise<{ message: string }> {
  try {
    const { token } = activateAccountDto;

    // Log the received activation token
    console.log('Received Activation Token:', token);

    // Verify the activation token
    const decodedToken = this.userService.verifyActivationToken(token);

    // Log the decoded activation token
    console.log('Decoded Activation Token:', decodedToken); 

    // Rest of your activation logic
    await this.authService.activateAccount(token);

    // Respond with a success message or any other relevant response
    return { message: 'Учетная запись успешно активирована' };
  } catch (error) {
    throw new BadRequestException('Недействительный токен активации');
  }
}

@Post('reset-password')
@ApiOperation({ summary: 'сброс пароля' })
@ApiOkResponse({ status: 200, description: 'Электронное письмо для сброса пароля отправлено успешно', type: Object })
@ApiBadRequestResponse({ status: 400, description: 'Не удалось отправить электронное письмо для сброса пароля' })
async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
  try {
    await this.authService.requestPasswordReset(resetPasswordDto.email);

    return { message: 'Электронное письмо для сброса пароля отправлено успешно' };
  } catch (error) {
    throw new BadRequestException('Не удалось отправить электронное письмо для сброса пароля');
  }
}

@Post('reset-password-confirm')
@ApiOperation({ summary: 'Сброс пароля подтвердите' })
@ApiOkResponse({ status: 200, description: 'Успешный сброс пароля', type: Object })
@ApiBadRequestResponse({ status: 400, description: 'Не удалось сбросить пароль' })
  async resetPassword(@Body() resetPasswordConfirmDto: ResetPasswordConfirmDto): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(
        resetPasswordConfirmDto.resetToken,
        resetPasswordConfirmDto.newPassword,
      );

      return { message: 'Успешный сброс пароля' };
    } catch (error) {
      throw new BadRequestException('Не удалось сбросить пароль');
    }
  }
}