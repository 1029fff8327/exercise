import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator'

export class CreateUserDto {

    @ApiProperty({example: 'user@gmail.com', description: 'Postal address'})
    @IsString({message: 'Must be a string'})
    @IsEmail( {}, {message: "Non-direct email"})
    public readonly email: string;

    @ApiProperty({example: '01927328', description: 'Password'})
    @IsString({message: 'Must be a string'})
    @Length(4, 16, {message: 'No less than 4 and no more than 16'})
    public readonly password: string;

}
