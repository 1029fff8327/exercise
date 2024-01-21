import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CreatePostDto } from '../dto/create-post.dto';
import { UserRepository } from 'src/repository/user.repository'; 

@Injectable()
export class PostService {
  private FILE_SERVICE_BASE_URL = 'http://localhost:3000'; 

  constructor(private readonly userRepository: UserRepository) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<any> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/posts`;

    try {
      const response = await axios.post(fileServiceUrl, {
        userId,
        text: createPostDto.text,
        fileId: createPostDto.fileId,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating post on file service:', error);
      throw new HttpException('Failed to create post on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createFile(data: any): Promise<any> {
    const fileServiceUrl = `${this.FILE_SERVICE_BASE_URL}/file-info`;

    try {
      const response = await axios.post(fileServiceUrl, data);

      return response.data;
    } catch (error) {
      console.error('Error creating file on file service:', error);
      throw new HttpException('Failed to create file on file service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveFileInfoToUser({ user, fileId, xApiKey }): Promise<void> {
    try {
      user.fileInfo = { fileId, xApiKey };
      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error saving file info to user:', error);
      throw new HttpException('Failed to save file info to user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
