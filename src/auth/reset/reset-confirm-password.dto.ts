import { IsString, MinLength } from 'class-validator';

export class ResetPasswordConfirmDto {
  @IsString()
  resetToken: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать как минимум 6 символов' })
  newPassword: string;
}