import { DynamicModule, Module } from '@nestjs/common';
import { RedisClientService } from './redis.client.service';
import { RedisConstants } from './redis.client.constants';
import { IRedisModuleAsyncOptions, IRedisModuleOptionsFactory } from './redis.client.interface';
import { RedisOptions } from 'ioredis';

@Module({})
export class RedisClientModule {
  static forRootAsync(options: IRedisModuleAsyncOptions): DynamicModule {
    const redisClientOptionsProvider = {
      provide: RedisConstants.options,
      useFactory: async (optionsFactory: IRedisModuleOptionsFactory) => await optionsFactory.createRedisModuleOptions(),
      inject: [options.useExisting],
    };

    const redisClientProvider = {
      provide: RedisConstants.client,
      useFactory: (opts: RedisOptions) => new RedisClientService(opts),
      inject: [RedisConstants.options],
    };

    return {
      module: RedisClientModule,
      imports: options.imports,
      providers: [redisClientOptionsProvider, redisClientProvider],
      exports: [redisClientProvider],
    };
  }
}
