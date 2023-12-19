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

      // Check if the token has expired
      const now = Math.floor(Date.now() / 1000);
      if (exp && now > exp) {
        throw new UnauthorizedException('Token has expired');
      }

      // You can also check if the token is close to expiration and refresh it
      const expirationBuffer = 60; // Refresh token if it's about to expire in 60 seconds
      if (exp && now + expirationBuffer > exp) {
        // Get a new access token using the refresh token
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

      // Type assertion for refreshToken
      const typedRefreshToken = refreshToken as string;

      const accessToken = this.extractAccessToken(user as IUser);

      return { ...sanitizedUser, refreshToken: typedRefreshToken, accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
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
