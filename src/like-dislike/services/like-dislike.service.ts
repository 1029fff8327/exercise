import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LikeDislikeService {
  private readonly FILE_SERVICE_BASE_URL = 'http://localhost:3000';  

  async likePost(postId: string, userId: string): Promise<void> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/like-dislike/like/${postId}`; 

    try {
      await axios.post(fileServiceUrl, { userId });
    } catch (error) {
      console.error('Error liking post on file service:', error);
      throw new HttpException('Failed to like post on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async dislikePost(postId: string, userId: string): Promise<void> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/like-dislike/dislike/${postId}`; 

    try {
      await axios.post(fileServiceUrl, { userId });
    } catch (error) {
      console.error('Error disliking post on file service:', error);
      throw new HttpException('Failed to dislike post on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
