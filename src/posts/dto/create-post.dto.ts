import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Nickname of the user',
    example: 'john_doe',
  })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Nickname cannot be empty' })
  nickname: string;

  @ApiProperty({
    description: 'Text content of the post',
    example: 'This is a post',
  })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Text cannot be empty' })
  text: string;

  @ApiProperty({
    description: 'Photo file',
    type: 'string',
    format: 'binary',
  })
  photo: any;
}
