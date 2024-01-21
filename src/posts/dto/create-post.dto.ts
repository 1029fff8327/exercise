import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'File ID',
    example: '12345',
    format: 'uuid',
  })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'File ID cannot be empty' })
  fileId: string;

  @ApiProperty({
    description: 'Text content of the post',
    example: 'This is a post',
  })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Text cannot be empty' })
  text: string;
}
