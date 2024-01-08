import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { RedisClientService } from './redis.client.service';
import { RedisConstants } from './redis.client.constants';
import { IRedisModuleAsyncOptions, IRedisModuleOptionsFactory } from './redis.client.interface';
import { RedisOptions } from 'ioredis';

@Module({})
export class RedisClientModule {
  public static forRootAsync(options: IRedisModuleAsyncOptions): DynamicModule {
    const RedisClientOptionsProvider: FactoryProvider = {
      provide: RedisConstants.options,
      useFactory: async (optionsFactory: IRedisModuleOptionsFactory) => await optionsFactory.createRedisModuleOptions(),
      inject: [options.useExisting],
    };

    const RedisClientProvider: FactoryProvider<RedisClientService> = {
      provide: RedisClientService,
      useFactory: (opts: RedisOptions) => new RedisClientService(opts),
      inject: [RedisConstants.options],
    };

    return {
      module: RedisClientModule,
      imports: options.imports,
      providers: [RedisClientProvider, RedisClientOptionsProvider],
      exports: [RedisClientProvider],
    };
  }
}
