import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostService } from '../services/post.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ApiResponse, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from 'multer';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID',
          format: 'uuid',
        },
        text: {
          type: 'string',
          description: 'Text content of the post',
        },
        photo: {
          type: 'string',
          format: 'binary', 
        },
      },
      required: ['userId', 'text', 'photo'],
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() photo: MulterFile,
  ) {
    const userId = req.user.id;
    const createdPost = await this.postService.createPost(userId, createPostDto, photo);

    return { post: createdPost };
  }
}
