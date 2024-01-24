import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddCommentDto } from '../dto/comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comment')
  @ApiOperation({ summary: 'Add a comment', description: 'Add a comment to the post with the specified ID' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  async addComment(@Param('postId') postId: string, @Body() body: AddCommentDto) {
    const { userId, text } = body;
    await this.commentService.addComment(postId, userId, text);
  }
}
