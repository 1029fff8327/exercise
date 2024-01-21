import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
  @ApiProperty({ description: 'User ID', example: '123' })
  userId: string;

  @ApiProperty({ description: 'Comment text', example: 'This is a comment' })
  text: string;
}
