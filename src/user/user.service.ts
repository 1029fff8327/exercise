import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.model';
import { Repository } from 'typeorm';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  user: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
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

  generateActivationToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    const options = {
      expiresIn: '1h',
    };

    return this.jwtService.sign(payload, options);
  }

  verifyActivationToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.error('Error verifying activation token:sendActivationEmail', error);
      throw new BadRequestException('Invalid activation token');
    }
  }

  async sendActivationEmail(user: User): Promise<void> {
    try {
      const resetToken = await this.generateResetToken(user);
      const resetLink = `resetToken=${resetToken}`;
      const subject = 'Password Reset';
      const text = `To reset your password, click the following link: ${resetLink}`;

      await this.mailService.sendMail(user.email, subject, text);
      console.log('Password reset email sent successfully.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new InternalServerErrorException('Error sending password reset email');
    }
  }


  generateRefreshToken(user: User): string {
    const payload = { sub: 'refreshToken', userId: user.id };
    const options = {
      expiresIn: '7d',
    };

    const refresh_token = uuidv4();

    this.redisService.getClient().set(refresh_token, user.id, 'EX', 604800);

    return this.jwtService.sign(payload, options);
  }


  generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    const options = {
      expiresIn: '1h',
    };

    const access_token = uuidv4();

    this.redisService.getClient().set(access_token, user.id, 'EX', 3600);

    return this.jwtService.sign(payload, options);
  }

  async generateResetToken(user: User): Promise<string> {
    const resetToken = uuidv4();

    await this.redisService.getClient().set(resetToken, user.id, 'EX', 3600);

    user.resetToken = resetToken;
    await this.userRepository.save(user);

    return resetToken;
  }

  async verifyResetToken(resetToken: string): Promise<User | null> {
    const userId = await this.redisService.getClient().get(resetToken);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.redisService.getClient().del(resetToken);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

async removeResetToken(user: User): Promise<void> {
  if (user.resetToken) {
    await this.redisService.getClient().del(user.resetToken);
  }

  user.resetToken = null;
  await this.userRepository.save(user);
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
