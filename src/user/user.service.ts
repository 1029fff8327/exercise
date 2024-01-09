import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.model';
import * as argon2 from "argon2";
import { UserRepository } from 'src/repository/user.repository';

@Injectable()
export class UserService {
  user: any;
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<{ user: User}> {
    try {
      await this.validateUserDoesNotExist(createUserDto.email);

      const user = await this.saveUser(createUserDto);

      return { user };
    } catch (error) {
      console.error('Error creating user:', error);
      this.handleCreateUserError(error);
    }
  }

  private async validateUserDoesNotExist(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('This email address already exists');
    }
  }

  private async saveUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),

    });

    return user;
  }

  private handleCreateUserError(error: any): void {
    if (error instanceof BadRequestException) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException({ message: 'Internal server error while creating user' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async updatePassword(user: User): Promise<void> {

    await this.userRepository.save(user);
  }

  
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: {
      email:email
    } })
  }


  async findById(userId: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      return user;
    } catch (error) {
      console.error('Error when searching by ID:', error);
      throw new BadRequestException('The user could not be found by ID');
    }
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    try {
      const isPasswordValid = await argon2.verify(user.password, password);

      return isPasswordValid;
    } catch (error) {

      return false;
    }
  }

  async updateUser(userId: string, updatedData: Partial<User>): Promise<void> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id: userId } });
      if (!existingUser) {
        throw new BadRequestException('The user was not found');
      }

      if (updatedData.email) {
        existingUser.email = updatedData.email;
      }

      if (updatedData.password) {
        existingUser.password = updatedData.password;
      }

      await this.userRepository.save(existingUser);
    } catch (error) {
      throw new BadRequestException('Failed to update the user');
    }
  }

  async updateUserActivation(userId: string, isActivated: boolean): Promise<void> {
    await this.userRepository.update(userId, { isActivated });
  }
}
