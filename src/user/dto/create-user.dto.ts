import { IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
    @IsEmail()
    email: string;

    @MinLength(6, { message: 'Пароль должен содержать как минимум 6 символов'})
    password: string;
}
