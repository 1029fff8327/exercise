import { DynamicModule, FactoryProvider, Global, Module } from '@nestjs/common';
import { IFlamingoClientOptions, FlamingoClient } from '../client';
import { FlamingoConstants } from './flamingo.constants';
import { IFlamingoAsyncOptions, IFlamingoConfigFactory } from './flamingo.interfaces';

@Global()
@Module({})
export class FlamingoModule {

  public static forRootAsync(asyncOptions: IFlamingoAsyncOptions): DynamicModule {
    const FlamingoOptionsProvider: FactoryProvider<IFlamingoClientOptions> = {
      provide: FlamingoConstants.optionsToken,
      useFactory: async(optionsFactory: IFlamingoConfigFactory) => {
        const config = await optionsFactory.createFlamingoConfig();
        return config;
      },
      inject: [asyncOptions.useExisting],
    };

    const FlamingoClientProvider: FactoryProvider<FlamingoClient> = {
      provide: FlamingoConstants.clientToken,
      useFactory: (options: IFlamingoClientOptions) => new FlamingoClient(options),
      inject: [
        FlamingoConstants.optionsToken,
      ],
    };

    const dynamicModule: DynamicModule = {
      module: FlamingoModule,
      imports: asyncOptions.imports,
      providers: [
        FlamingoOptionsProvider,
        FlamingoClientProvider,
      ],
      exports: [
        FlamingoClientProvider,
      ],
    };
    return dynamicModule;
  }

}
