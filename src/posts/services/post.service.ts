import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CreatePostDto } from '../dto/create-post.dto';
import { MulterFile } from 'multer';

@Injectable()
export class PostService {
  private FILE_SERVICE_BASE_URL = 'http://localhost:3000';

  async createPost(userId: string, createPostDto: CreatePostDto, photo: MulterFile): Promise<any> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/posts/${userId}/create`;

    try {
      const { text } = createPostDto;

      const photoBuffer = photo.buffer;

      const response = await axios.post(fileServiceUrl, {
        text,
        photo: photoBuffer.toString('base64'),
      });

      return response.data;
    } catch (error) {
      console.error('Error creating post on file service:', error);
      throw new HttpException('Failed to create post on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
