import { Controller, Post, Param, UseGuards, Request, Body} from '@nestjs/common';
import { LikeDislikeService } from '../services/like-dislike.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LikeDislikeDto } from '../dto/like-dislike.dto';

@ApiTags('like-dislike')
@Controller('like-dislike')
export class LikeDislikeController {
  constructor(private readonly likeDislikeService: LikeDislikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('like')
  @ApiOperation({ summary: 'Like a post', description: 'Like a post with the specified ID' })
  @ApiResponse({ status: 200, description: 'Post liked successfully' })
  async likePost(@Param('postId') postId: string, @Request() req, @Body() body: LikeDislikeDto) {
    const userId = req.user.id;
    await this.likeDislikeService.likePost(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dislike')
  @ApiOperation({ summary: 'Dislike a post', description: 'Dislike a post with the specified ID' })
  @ApiResponse({ status: 200, description: 'Post disliked successfully' })
  async dislikePost(@Param('postId') postId: string, @Request() req, @Body() body: LikeDislikeDto) {
    const userId = req.user.id;
    await this.likeDislikeService.dislikePost(postId, userId);
  }
}
