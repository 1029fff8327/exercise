import { ModuleMetadata, Type } from '@nestjs/common';
import { IFlamingoClientOptions } from '../client';

export interface IFlamingoConfigFactory {
  createFlamingoConfig(): Promise<IFlamingoClientOptions> | IFlamingoClientOptions;
}

export interface IFlamingoAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting: Type<IFlamingoConfigFactory>;
}
