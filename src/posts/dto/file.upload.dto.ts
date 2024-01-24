import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    description: 'Base64-encoded file content',
    example: 'data:image/jpeg;base64,...', 
  })
  @IsString({ message: 'Must be a string' })
  content: string;
}
