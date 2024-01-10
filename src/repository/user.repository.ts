import { EntityRepository, Repository } from 'typeorm';
import { User } from 'src/user/user.model';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

}