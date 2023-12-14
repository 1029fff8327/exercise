import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
      UserModule,
      AuthModule,
      ConfigModule.forRoot({ isGlobal: true}),
      TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'root',
        database: process.env.POSTGRES_DB || 'program',
        port: Number.parseInt(process.env.DB_PORT, 10),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
      }),
      inject: [ConfigService]
  }), 
   
],
  controllers: [],
  providers: [],
})
export class AppModule {}