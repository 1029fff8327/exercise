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
      "Password reset request",
      `To reset your password, click on the following link: http://your-frontend-url/reset-password?token=${resetToken}`,
     );
    }

    async someMethod(): Promise<void> {
      try {
        const userId = 'exampleUserId'; 
        const user: User | undefined = await this.userService.findById(userId);
  
        if (user) {
          console.log(user.email); 
        } else {
          throw new BadRequestException('The user was not found');
        }
      } catch (error) {
        console.error('The user was not found:', error);
        throw new BadRequestException('Failed to execute any method');
      }
    }
  
    async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    
      const user = await this.userService.verifyResetToken(resetToken);
  
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }
  
      try {
        user.password = await argon2.hash(newPassword);
        await this.userService.updatePassword(user);
        await this.userService.removeResetToken(user);
  
        await this.mailService.sendMail(
          user.email,
          "Password reset completed successfully",
          "Your password has been successfully reset",
        );
      } catch (error) {
        console.error('Password reset error:', error);
        throw new BadRequestException("An error occurred when resetting the password");
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
      console.error('Error generating reset token:', error);
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
      throw new BadRequestException('Invalid user data for generating the update token');
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
        console.error('The access token could not be updated:', error);
        throw new BadRequestException('Failed to update refresh access token');
      }
    }
  
    async verifyResetToken(resetToken: string): Promise<User | null> {
      try {
        const userId = await this.redisClient.get(`resetToken:${resetToken}`);
  
        if (!userId) {
          throw new BadRequestException('Invalid or expired reset token');
        }
  
        const user = await this.userRepository.findOne(userId);
  
        if (!user) {
          throw new BadRequestException('Mistake');
        }
  
        return user;
      } catch (error) {
        console.error('Error checking the reset token:', error);
        return null;
      }
    }

    async login(email: string, password: string) {
      const user = await this.userService.findByEmail(email);
  
      if (!user || !(await this.userService.checkPassword(user, password))) {
        throw new BadRequestException('Invalid credentials');
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
        console.error('Error deleting the reset token:', error);
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
      throw new BadRequestException('Incorrect password or account is not activated');
    }
  
    const passwordIsMatch = await argon2.verify(user.password, password);
  
    const sanitizedUser = {
      id: escape(user.id.toString()),
      email: escape(user.email),
      isActivated: user.isActivated,
    };

    if (!sanitizedUser || !passwordIsMatch || !sanitizedUser.isActivated) {
      throw new BadRequestException('Incorrect password or account is not activated');
    }

    return sanitizedUser;
  }
  
  async activateAccount(token: string): Promise<void> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);

      const user = await this.userService.findByEmail(decodedToken.email);

      if (!user) {
        throw new BadRequestException('Invalid activation token');
      }

      if (user.isActivated) {
        throw new BadRequestException('The account has already been activated');
      }

      await this.userService.updateUserActivation(user.id, true);

    } catch (error) {
      throw new BadRequestException('Invalid activation token');
    }
  }

}