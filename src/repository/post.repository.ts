import { Post } from 'src/posts/models/post.model'; 
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {

}
