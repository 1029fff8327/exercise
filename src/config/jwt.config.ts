import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions, JwtOptionsFactory } from "@nestjs/jwt";

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
    private readonly secret: string;

    constructor(configService: ConfigService) {
        this.secret = configService.get('JWT_SECRET');
    }

    createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
        return {
            secret: this.secret,
        };
    }
}