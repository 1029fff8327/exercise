import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommentService {
  private readonly FILE_SERVICE_BASE_URL = 'http://localhost:3000';  

  async addComment(postId: string, userId: string, text: string): Promise<void> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/posts/${postId}/comment`;

    try {
      await axios.post(fileServiceUrl, { userId, text });
    } catch (error) {
      console.error('Error adding comment on file service:', error);
      throw new HttpException('Failed to add comment on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
