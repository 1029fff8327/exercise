import { BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.model';
import { Repository } from 'typeorm';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  user: any;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
      });

      const refreshToken = this.jwtService.sign({ email: createUserDto.email });

      return { user, refreshToken };
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
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

  
 }