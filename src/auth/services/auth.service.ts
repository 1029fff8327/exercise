import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from 'src/user/services/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../../types/types';
import { MailService } from 'src/mail/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/user.repository';
import { RedisConstants } from 'src/global/redis-client';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = new Redis({ host: 'localhost', port: 6379 });
  }
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        return;
      }

      const resetToken = await this.generateResetToken(user);

      await this.mailService.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to: user.email,
        subject: 'Password reset request',
        text: `To reset your password, click on the following link: http://your-frontend-url/reset-password?token=${resetToken}`,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }
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
    try {
      const user = await this.verifyResetToken(resetToken);

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      user.password = newPassword;
      await this.userRepository.save(user);

      await this.mailService.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to: user.email,
        subject: 'Password reset completed successfully',
        text: 'Your password has been successfully reset',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw new BadRequestException(
        'An error occurred when resetting the password',
      );
    }
  }

  async generateResetToken(user: User): Promise<string> {
    try {
      const resetToken = await this.jwtService.signAsync(
        { id: user.id, email: user.email },
        {
          expiresIn: this.configService.get<number>(
            'JWT_RESET_EXPIRATION_TIME',
          ),
        },
      );

      const key = `${RedisConstants.resetTokenPrefix}${resetToken}`;
      await this.redisClient.set(key, user.id, 'EX', 3600);

      await this.userRepository.save(user);

      return resetToken;
    } catch (error) {
      console.error('Error generating reset token:', error);
      return null;
    }
  }

  generateAccessToken(user: IUser): string {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    const key = `${RedisConstants.accessTokenPrefix}${accessToken}`;
    this.redisClient.set(key, user.id, 'EX', 3600);

    return accessToken;
  }

  generateRefreshToken(user: IUser): string {
    const { id, email } = user;
    if (!id || !email) {
      throw new BadRequestException(
        'Invalid user data for generating the update token',
      );
    }

    const refreshToken = this.jwtService.sign(
      { id, email },
      {
        expiresIn: this.configService.get<number>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      },
    );

    const key = `${RedisConstants.refreshTokenPrefix}${refreshToken}`;
    this.redisClient.set(key, id, 'EX', 604800);

    return refreshToken;
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
    const key = `${RedisConstants.resetTokenPrefix}${resetToken}`;
    const userId = await this.redisClient.get(key);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.redisClient.del(key);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async removeResetToken(user: User): Promise<void> {
    if (user.resetToken) {
      const key = `${RedisConstants.resetTokenPrefix}${user.resetToken}`;
      await this.redisClient.del(key);
    }

    user.resetToken = null;
    await this.userRepository.save(user);
  }

  async updatePassword(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  generateActivationToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    const options = {
      expiresIn: '1h',
    };

    const activationToken = this.jwtService.sign(payload, options);
    const key = `${RedisConstants.activationTokenPrefix}${activationToken}`;

    this.redisClient.set(key, user.id, 'EX', 3600);

    return activationToken;
  }

  verifyActivationToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.error('Error verifying activation token:', error);
      throw new BadRequestException('Invalid activation token');
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
    const refreshToken = this.generateRefreshToken(user);
    const activationToken = this.generateActivationToken(user);
    const expiresIn = 3600;

    return {
      accessToken,
      refreshToken,
      activationToken,
      expiresIn,
    };
  }

  async sendActivationEmail(user: User): Promise<void> {
    try {
      const resetToken = await this.generateResetToken(user);
      const resetLink = `resetToken=${resetToken}`;
      const subject = 'Password Reset';
      const text = `To reset your password, click the following link: ${resetLink}`;

      await this.mailService.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to: user.email,
        subject,
        text,
      });

      console.log('Password reset email sent successfully.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new InternalServerErrorException(
        'Error sending password reset email',
      );
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(
        'Incorrect password or account is not activated',
      );
    }

    const passwordIsMatch = await argon2.verify(user.password, password);

    const sanitizedUser = {
      id: escape(user.id.toString()),
      email: escape(user.email),
      isActivated: user.isActivated,
    };

    if (!sanitizedUser || !passwordIsMatch || !sanitizedUser.isActivated) {
      throw new BadRequestException(
        'Incorrect password or account is not activated',
      );
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
