import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LikeDislikeDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID', example: '123', format: 'uuid' })
  userId: string;
}
