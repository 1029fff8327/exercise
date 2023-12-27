import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify as jwtVerify, JwtPayload } from 'jsonwebtoken'; 
import { IUser } from '../types/types';
import { AuthService } from '../auth.service'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(tokenPayload: any) {
    try {
      const decodedToken = jwtVerify(tokenPayload, this.configService.get('JWT_SECRET')) as JwtPayload;
      const { exp, iat, ...user } = typeof decodedToken === 'string' ? {} as IUser : decodedToken as IUser;

      const now = Math.floor(Date.now() / 1000);
      if (exp && now > exp) {
        throw new UnauthorizedException('Срок действия токена истек');
      }

      const expirationBuffer = 60; 
      if (exp && now + expirationBuffer > exp) {

        const refreshedUser = await this.authService.refreshAccessToken(user as IUser);
        if (refreshedUser) {
          return refreshedUser;
        }
      }

      const sanitizedUser = { id: escape((user as IUser).id), email: escape((user as IUser).email) };

      if (!sanitizedUser.id || !sanitizedUser.email) {
        throw new BadRequestException('Неверные пользовательские данные');
      }

      const refreshToken = this.extractRefreshToken(user as IUser);

      const typedRefreshToken = refreshToken as string;

      const accessToken = this.extractAccessToken(user as IUser);

      return { ...sanitizedUser, refreshToken: typedRefreshToken, accessToken };
    } catch (error) {
      throw new UnauthorizedException('Недопустимый токен');
    }
  }

  private extractAccessToken(user: IUser): string | null {
    if (user && 'accessToken' in user && typeof user.accessToken === 'string') {
      return user.accessToken;
    } else {
      throw new BadRequestException('Недоступный токен доступа');
    }
  }

  private extractRefreshToken(user: IUser): string | null {
    if (user && 'refreshToken' in user) {
      return (user as IUser)?.refreshToken ?? null;
    } else {
      throw new BadRequestException('Недоступный токен обновления');
    }
  }
}
