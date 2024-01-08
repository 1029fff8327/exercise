import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { RedisOptions } from 'ioredis';

export interface IRedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisOptions> | RedisOptions;
}

export interface IRedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting: Type<IRedisModuleOptionsFactory>;
}