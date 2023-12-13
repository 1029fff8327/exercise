import {
  BadRequestException,
  Injectable,
  UnauthorizedException
 } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2"
import { JwtService } from '@nestjs/jwt';
import { IUser } from './types/types';


@Injectable()
export class AuthService {
 constructor(
  private readonly userService: UserService,
  private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    const passwordIsMatch = await argon2.verify(user.password, password)

    if (user && user.password === password) {
      return null;
    }
    throw new UnauthorizedException('Не коректный пароль');
  }
  async login(user: IUser) {
    const { id, email } = user
    return {
      id,
      email,
      refreshToken: this.jwtService.sign({ id:user.id, email:user.email}),
    }
  }
}