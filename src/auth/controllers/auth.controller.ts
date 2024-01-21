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
import { AuthService } from '../services/auth.service';
import { ResetPasswordDto } from '../../reset/reset-password.dto';
import { ResetPasswordConfirmDto } from '../../reset/reset-confirm-password.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/Login.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { UserService } from 'src/user/services/user.service';
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
  @ApiBody({
    type: CreateUserDto,
    description: 'User data for creating a new user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.create(createUserDto);
      return {
        message: 'The user has been successfully created',
        user: result.user,
      };
    } catch (error) {
      this.handleCreateUserError(error);
    }
  }

  private handleCreateUserError(error: any): never {
    if (error instanceof BadRequestException) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      { message: 'Internal server error when creating a user' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in to the app' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has successfully logged in',

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
      const result = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        activationToken: result.activationToken,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Invalid login credentials' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Activate Account' })
  @Post('activate-account')
  @ApiOperation({ summary: 'Activate your account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The account has been successfully activated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid activation token',
  })
  async activateAccount(
    @Body() activateAccountDto: ActivateAccountDto,
  ): Promise<{ message: string }> {
    try {
      const { token } = activateAccountDto;
      console.log('Received Activation Token:', token);
      const decodedToken = this.authService.verifyActivationToken(token);
      console.log('Decoded Activation Token:', decodedToken);
      await this.authService.activateAccount(token);

      return { message: 'The account has been successfully activated' };
    } catch (error) {
      throw new BadRequestException('Invalid activation token');
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'password reset' })
  @ApiOkResponse({
    status: 200,
    description: 'The password reset email was sent successfully',
    type: Object,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Failed to send an email to reset your password',
  })
  async requestPasswordReset(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userService.findByEmail(resetPasswordDto.email);

      if (user) {
        await this.authService.sendActivationEmail(user);
        return { message: 'The password reset email was sent successfully' };
      } else {
        throw new NotFoundException('The user was not found');
      }
    } catch (error) {
      throw new BadRequestException(
        'Failed to send an email to reset your password',
      );
    }
  }

  @Post('reset-password-confirm')
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiOkResponse({
    status: 200,
    description: 'Successful password reset',
    type: Object,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'The password could not be reset',
  })
  async resetPassword(
    @Body() resetPasswordConfirmDto: ResetPasswordConfirmDto,
  ): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(
        resetPasswordConfirmDto.resetToken,
        resetPasswordConfirmDto.newPassword,
      );

      return { message: 'Successful password reset' };
    } catch (error) {
      throw new BadRequestException('The password could not be reset');
    }
  }
}
