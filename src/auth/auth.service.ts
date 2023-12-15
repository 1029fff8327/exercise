import {
  BadRequestException,
  Injectable,
  UnauthorizedException
 } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2"
import { JwtService } from '@nestjs/jwt';
import { IUser } from './types/types';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  private readonly userRepository: Repository<User>;

 constructor(
  private readonly userService: UserService,
  private readonly jwtService: JwtService,
  private readonly mailService: MailService,
  private readonly configService: ConfigService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      
      return;
    }

    const resetToken = await this.userService.generateResetToken(user);

    await this.mailService.sendMail(
      user.email,
      "Запрос на сброс пароля",
      `Чтобы сбросить свой пароль, перейдите по следующей ссылке: http://your-frontend-url/reset-password?token=${resetToken}`,
     );
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    
      const user = await this.userService.verifyResetToken(resetToken);
  
      if (!user) {
        throw new BadRequestException('Недействительный или просроченный токен сброса');
      }
  
      try {
 
        user.password = await argon2.hash(newPassword);
        await this.userService.updatePassword(user);
  
        await this.userService.removeResetToken(user);
  
        await this.mailService.sendMail(
          user.email,
          "Сброс пароля завершен успешно",
          "Ваш пароль был успешно сброшен",
        );
      } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        throw new BadRequestException("Ошибка при сбросе пароля");
      }
    }  

    async generateResetToken(user: User): Promise<string> {
      const resetToken = await this.jwtService.signAsync(
        { id: user.id, email: user.email },
        { expiresIn: this.configService.get<number>('JWT_RESET_EXPIRATION_TIME') },
      );
  
      await this.userRepository.save(user);
  
      return resetToken;
    }

  async createActivationToken(user: IUser): Promise<string> {
    const activationToken = await this.jwtService.signAsync(
      { id: user.id, email: user.email },
      { expiresIn: '1d' }, 
    );
    await this.mailService.sendActivationEmail(user.email, activationToken);

    return activationToken;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
  
    if (!user) {
      throw new BadRequestException('Некорректный пароль или аккаунт не активирован');
    }
  
    const passwordIsMatch = await argon2.verify(user.password, password);
  
    const sanitizedUser = {
      id: escape(user.id.toString()),
      email: escape(user.email),
      isActivated: user.isActivated,
    };

    if (!sanitizedUser || !passwordIsMatch || !sanitizedUser.isActivated) {
      throw new BadRequestException('Некорректный пароль или аккаунт не активирован');
    }

    return sanitizedUser;
  }
  
  async login(user: IUser): Promise<any> {
    const { id, email } = user;

    const sanitizedUser = { id: escape(id), email: escape(email) };

    if (!sanitizedUser.id || !sanitizedUser.email) {
      throw new BadRequestException("Неверные пользовательские данные");
    }

    return {
      id: sanitizedUser.id,
      email: sanitizedUser.email,
      refreshToken: this.jwtService.sign({ id: user.id, email: user.email }),
    };
  }
}
