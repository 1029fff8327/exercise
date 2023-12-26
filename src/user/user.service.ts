import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.model';
import { Repository } from 'typeorm';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  user: any;
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ user: User}> {
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
      activationToken: this.generateActivationToken(),
    });

    return user;
  }

  private async generateTokens(user: User): Promise<{ refreshToken: string; accessToken: string }> {
    const refreshToken = this.generateRefreshToken(user);
    const accessToken = this.generateAccessToken(user);
  
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
  
    await this.userRepository.save(user);
  
    return { refreshToken, accessToken };
  }

  private handleCreateUserError(error: any): void {
    if (error instanceof BadRequestException) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException({ message: 'Internal server error while creating user' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  
  generateActivationToken(): string {
    const crypto = require('crypto');

    return crypto.randomBytes(32).toString('hex'); 
  }

  async sendActivationEmail(user: User): Promise<void> {
    const activationLink = `http://your-frontend-url/activate-account?token=${user.activationToken}`;
    const subject = 'Активация учетной записи';
    const text = `Для активации вашей учетной записи перейдите по ссылке: ${activationLink}`;
  
    await this.mailService.sendMail(user.email, subject, text);
  }

generateRefreshToken(user: User): string {
  const payload = { sub: 'refreshToken', userId: user.id }; 
  const options = {
    expiresIn: '7d', 
  };
  const secret = process.env.JWT_SECRET;

  return jwt.sign(payload, secret, options);
  }

  generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email }; 
    const options = {
      expiresIn: '1h', 
    };

    return this.jwtService.sign(payload, options);
  }
  
  async generateResetToken(user: User): Promise<string> {

    const resetToken = 'generate_your_reset_token_logic_here';
    
    user.resetToken = resetToken;
    await this.userRepository.save(user);

    return resetToken;
   
  }

  async verifyResetToken(resetToken: string): Promise<User | null> {

    const user = await this.userRepository.findOne({ where: { resetToken } });

    if (!user) {
      throw new BadRequestException('Ошибка');
    }

    return user;
  }

  async removeResetToken(user: User): Promise<void> {

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
      console.error('Ошибка при поиске по ID:', error);
      throw new BadRequestException('Не удалось найти пользователя по ID');
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
        throw new BadRequestException('Пользователь не найден');
      }

      if (updatedData.email) {
        existingUser.email = updatedData.email;
      }

      if (updatedData.password) {
        existingUser.password = updatedData.password;
      }

      await this.userRepository.save(existingUser);
    } catch (error) {
      throw new BadRequestException('Не удалось обновить пользователя');
    }
  }

  async updateUserActivation(userId: string, isActivated: boolean): Promise<void> {
    await this.userRepository.update(userId, { isActivated });
  }
}