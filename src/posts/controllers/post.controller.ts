import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostService } from '../services/post.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    const userId = createPostDto.userId || req.user.id; 
    const createdPost = await this.postService.createPost(userId, createPostDto);

    return { post: createdPost };
  }
}
