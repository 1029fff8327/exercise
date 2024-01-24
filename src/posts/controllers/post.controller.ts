import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostService } from '../services/post.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ApiResponse, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from 'multer';
import { UserService } from 'src/user/services/user.service';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: {
          type: 'string',
          description: 'Nickname of the user',
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
      required: ['nickname', 'text', 'photo'],
    },
  })
  @ApiParam({
    name: 'nickname',
    description: 'Nickname of the user',
    required: true,
    type: 'string',
  })
  @UseInterceptors(FileInterceptor('photo'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() photo: MulterFile,
  ) {
    try {
      const nickname = createPostDto.nickname;
      const user = await this.userService.findByNickname(nickname);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const createdPost = await this.postService.createPost(user.id, createPostDto, photo);

      return { post: createdPost };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new HttpException('Internal server error while creating post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
