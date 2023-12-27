import { DynamicModule, FactoryProvider, Global, Module } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { RedisConstants } from './redis-client.constants';
import { IRedisModuleAsyncOptions, IRedisModuleOptionsFactory } from './redis-client.interface';


@Global()
@Module({})
export class RedisClientModule {

  public static forRootAsync(
    options: IRedisModuleAsyncOptions,
  ): DynamicModule {
    const RedisClientOptionsProvider: FactoryProvider = {
      provide: RedisConstants.options,
      useFactory: async(optionsFactory: IRedisModuleOptionsFactory) => {
        const config = await optionsFactory.createRedisModuleOptions();
        return config;
      },
      inject: [options.useExisting],
    };

    const RedisClientProvider: FactoryProvider<Redis> = {
      provide: RedisConstants.client,
      useFactory(opts: RedisOptions): Redis {
        return new Redis(opts);
      },
      inject: [RedisConstants.options],
    };

    const dynamicModule: DynamicModule = {
      module: RedisClientModule,
      imports: options.imports,
      providers: [
        RedisClientProvider,
        RedisClientOptionsProvider,
      ],
      exports: [RedisClientProvider],
    };

    return dynamicModule;
  }

}
