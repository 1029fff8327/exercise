import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'User ID',
    example: '12345',
    format: 'uuid',
  })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  @IsUUID('4', { message: 'Invalid UUID format' })
  userId: string;

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
