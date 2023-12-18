import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @MinLength(6, { message: 'Пароль должен содержать как минимум 6 символов'})
    password: string;
}
