import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const existUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    })
    if(existUser) throw new BadRequestException('Этот электронный адрес уже существует')

    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
    })

    const refreshToken = this.jwtService.sign({ email: createUserDto.email })

    return { user, refreshToken };
  }
  
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { 
      email:email 
    } })
  }

  async findUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.user.userEntity.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
 }