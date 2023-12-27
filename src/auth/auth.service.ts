import {
  BadRequestException, Injectable
 } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { IUser } from './types/types';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.model';
import { Repository } from 'typeorm';
import { RedisService } from '@liaoliaots/nestjs-redis';  
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  private readonly redisClient;

 constructor(
  @InjectRepository(User) 
  private readonly userRepository: Repository<User>,
  private readonly userService: UserService,
  private readonly jwtService: JwtService,
  private readonly mailService: MailService,
  private readonly configService: ConfigService,
  private readonly redisService: RedisService,
  ) {
    this.redisClient = this.redisService.getClient();
  }

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

    async someMethod(): Promise<void> {
      try {
        const userId = 'exampleUserId'; 
        const user: User | undefined = await this.userService.findById(userId);
  
        if (user) {
          console.log(user.email); 
        } else {
          throw new BadRequestException('Пользователь не найден');
        }
      } catch (error) {
        console.error('Пользователь не найден:', error);
        throw new BadRequestException('Не удалось выполнить какой-либо метод');
      }
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
  
      await this.redisClient.set(`resetToken:${resetToken}`, user.id, 'EX', 3600); 

      await this.userRepository.save(user);
  
      return resetToken;
    } catch (error) {
      console.error('Ошибка, генерирующая токен сброса:', error);
      return null;
    }
   
    public generateAccessToken(user: IUser): string {

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return accessToken;
  }

  generateRefreshToken(user: IUser): string {
    const { id, email } = user;
    if (!id || !email) {
      throw new BadRequestException('Недопустимые пользовательские данные для генерации токена обновления');
    }
  
    return this.jwtService.sign({ id, email }, { expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRATION_TIME') });
  }

    async refreshAccessToken(user: IUser): Promise<IUser> {   
      try {
        const refreshedAccessToken = this.generateAccessToken(user);
    
        if ('refreshToken' in user) {
          (user as User).refreshToken = refreshedAccessToken;
        }
    
        await this.userRepository.save(user as User);
    
        return user as IUser;
      } catch (error) {
        console.error('Не удалось обновить токен доступа:', error);
        throw new BadRequestException('Не удалось обновить refresh access token');
      }
    }
  
    async verifyResetToken(resetToken: string): Promise<User | null> {
      try {
        const userId = await this.redisClient.get(`resetToken:${resetToken}`);
  
        if (!userId) {
          throw new BadRequestException('Недействительный или просроченный токен сброса');
        }
  
        const user = await this.userRepository.findOne(userId);
  
        if (!user) {
          throw new BadRequestException('Ошибка');
        }
  
        return user;
      } catch (error) {
        console.error('Ошибка при проверке токена сброса:', error);
        return null;
      }
    }

    async login(email: string, password: string) {
      const user = await this.userService.findByEmail(email);
  
      if (!user || !(await this.userService.checkPassword(user, password))) {
        throw new BadRequestException('Неверные учетные данные');
      }
  
      const payload: IUser = {
        id: user.id,
        email: user.email,
        isActivated: user.isActivated,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
  
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.userService.generateRefreshToken(user);
      const activationToken = this.userService.generateActivationToken(user);
      const expiresIn = 3600; 

      return {
        accessToken,
        refreshToken,
        activationToken, 
        expiresIn,
      };
    }
     
    async sendActivationEmail(user: User): Promise<void> {
      await this.mailService.sendActivationEmail(user);
    }

    async removeResetToken(user: User): Promise<void> {
      try {
        await this.redisClient.del(`resetToken:${user.resetToken}`);
      } catch (error) {
        console.error('Ошибка при удалении токена сброса:', error);
      }
    }

  async createActivationToken(user: IUser): Promise<string> {
    const activationToken = await this.jwtService.signAsync(
      { id: user.id, email: user.email },
      { expiresIn: '1d' }, 
    );
    await this.mailService.sendActivationEmail({ email: user.email, activationToken });

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
  
  async activateAccount(token: string): Promise<void> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);

      const user = await this.userService.findByEmail(decodedToken.email);

      if (!user) {
        throw new BadRequestException('Недействительный токен активации');
      }

      if (user.isActivated) {
        throw new BadRequestException('Учетная запись уже активирована');
      }

      await this.userService.updateUserActivation(user.id, true);

    } catch (error) {
      throw new BadRequestException('Недействительный токен активации');
    }
  }

}