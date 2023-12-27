import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordConfirmDto {
  @ApiProperty()
  @IsString()
  resetToken: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'The password must contain at least 6 characters' })
  newPassword: string;
}