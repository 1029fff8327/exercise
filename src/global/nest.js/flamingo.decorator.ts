import { Inject } from '@nestjs/common';
import { FlamingoConstants } from './flamingo.constant';


export const InjectFlamingo = (): ReturnType<typeof Inject> => (
  Inject(FlamingoConstants.clientToken)
);