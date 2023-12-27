import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpStatus,
  HttpException,
  NotFoundException,
  ValidationPipe,
  UsePipes,
 } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './reset/reset-password.dto';
import { ResetPasswordConfirmDto } from './reset/reset-confirm-password.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { LoginDto } from './dto/Login.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    ) {}

    
  @ApiOperation({ summary: 'Create User' })
  @Post('register') 
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CreateUserDto, description: 'Пользовательские данные для создания нового пользователя' })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно создан',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'плохой запрос' 
  })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.create(createUserDto);
      return {
        message: 'Пользователь успешно создан',
        user: result.user,
      };
    } catch (error) {
      this.handleCreateUserError(error);
    }
  }

  private handleCreateUserError(error: any): never {
    if (error instanceof BadRequestException) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException({ message: 'Внутренняя ошибка сервера при создании пользователя' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }


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

    console.log('Received Activation Token:', token);

    const decodedToken = this.userService.verifyActivationToken(token);

    console.log('Decoded Activation Token:', decodedToken); 

    await this.authService.activateAccount(token);

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
      const user = await this.userService.findByEmail(resetPasswordDto.email);

      if (user) {
        await this.userService.sendActivationEmail(user);
        return { message: 'Электронное письмо для сброса пароля отправлено успешно' };
      } else {
        throw new NotFoundException('Пользователь не найден');
      }
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