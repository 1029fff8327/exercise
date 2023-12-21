import { BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.model';
import { Repository } from 'typeorm';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  private readonly authService: AuthService;
  user: any;
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existUser) {
        throw new BadRequestException('Этот электронный адрес уже существует');
      }

      const { user, refreshToken, accessToken } = await this.saveUser(createUserDto);

      return { user, refreshToken, accessToken };
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }

  async saveUser(createUserDto: CreateUserDto): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
      activationToken: this.generateActivationToken(),
    });

    user.refreshToken = this.authService.generateRefreshToken(user);
    user.accessToken = this.generateAccessToken(user);

    await this.userRepository.save(user);

    const refreshToken = this.jwtService.sign({ email: createUserDto.email });
    return { user, refreshToken, accessToken: user.accessToken };
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

    return this.jwtService.sign(payload, options);
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
      console.error('Error in findById:', error);
      throw new BadRequestException('Failed to find user by ID');
    }
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    try {
      // Сравниваем хэшированный пароль из базы данных с введенным паролем
      const isPasswordValid = await argon2.verify(user.password, password);

      return isPasswordValid;
    } catch (error) {
      // Обработка ошибок
      return false;
    }
  }

  async updateUser(userId: string, updatedData: Partial<User>): Promise<void> {
    try {
      // Проверка, существует ли пользователь с указанным ID
      const existingUser = await this.userRepository.findOne({ where: { id: userId } });
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }

      // Обновление данных пользователя
      if (updatedData.email) {
        existingUser.email = updatedData.email;
      }

      if (updatedData.password) {
        existingUser.password = updatedData.password;
      }


      // Сохранение обновленного пользователя в базе данных
      await this.userRepository.save(existingUser);
    } catch (error) {
      // Обработка ошибок при обновлении пользователя
      throw new BadRequestException('Failed to update user');
    }
  }

  async updateUserActivation(userId: string, isActivated: boolean): Promise<void> {
    await this.userRepository.update(userId, { isActivated });
  }
 }