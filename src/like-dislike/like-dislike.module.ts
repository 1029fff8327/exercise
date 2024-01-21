import { Module } from '@nestjs/common';
import { LikeDislikeController } from './controllers/like-dislike.controller';
import { LikeDislikeService } from './services/like-dislike.service';

@Module({
  controllers: [LikeDislikeController],
  providers: [LikeDislikeService],
})
export class LikeDislikeModule {}
