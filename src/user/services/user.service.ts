import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<{ user: User }> {
    try {
      let user: User | undefined;

      await this.validateUserDoesNotExist(createUserDto.email);

      user = await this.saveUser(createUserDto);

      return { user };
    } catch (error) {
      console.error('Error creating user:', error);
      this.handleCreateUserError(error);
      throw error;
    }
  }

  private async validateUserDoesNotExist(email: string): Promise<void> {
    try {
      console.log('Attempting to find user by email:', email);
      const existingUser = await this.userRepository.findOne({ where: { email } });

      if (existingUser) {
        console.log('User found:', existingUser);
        throw new HttpException('This email address already exists', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Error validating user existence:', error);
      if (!(error instanceof HttpException && error.getResponse() === 'This email address already exists')) {
        console.error('Unexpected error:', error);
        throw new HttpException('Internal server error during user validation', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  private async saveUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
      });

      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      throw new HttpException('Internal server error while saving user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    return await this.userRepository.findOne({ where: { email: email } });
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
        existingUser.password = await argon2.hash(updatedData.password);
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
