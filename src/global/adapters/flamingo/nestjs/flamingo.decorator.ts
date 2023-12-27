import { Inject } from '@nestjs/common';
import { FlamingoConstants } from './flamingo.constants';

export const InjectFlamingo = (): ReturnType<typeof Inject> => (
  Inject(FlamingoConstants.clientToken)
);
