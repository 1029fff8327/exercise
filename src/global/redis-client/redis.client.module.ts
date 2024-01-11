import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisConfig } from 'src/config/redis.config'; 
import { RedisConstants } from './redis.client.constants'; 
import Redis from 'ioredis';

@Module({})
export class RedisClientModule {
  static forRootAsync(options: { useClass: typeof RedisConfig }): DynamicModule {
    const redisConfigProvider: Provider = {
      provide: RedisConfig,
      useClass: options.useClass,
    };

    const redisServiceProvider: Provider = {
      provide: RedisConstants.client,
      useFactory: async (config: RedisConfig) => {
        const { host, port, password } = await config.createRedisModuleOptions();
        return new Redis({ host, port, password });
      },
      inject: [RedisConfig],
    };

    return {
      module: RedisClientModule,
      providers: [redisConfigProvider, redisServiceProvider],
      exports: [redisServiceProvider],
    };
  }
}
