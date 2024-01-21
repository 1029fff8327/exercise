import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { UserModule } from 'src/user/user.module'; 

@Module({
  imports: [UserModule], 
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
