import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Email address' })
  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  public readonly email: string;

  @ApiProperty({ example: '01927328', description: 'Password' })
  @IsString({ message: 'Must be a string' })
  @Length(4, 16, { message: 'Must be between 4 and 16 characters' })
  public readonly password: string;

  @ApiProperty({ example: 'JohnDoe', description: 'Nickname' }) 
  @IsString({ message: 'Must be a string' })
  public readonly nickname: string;
}
