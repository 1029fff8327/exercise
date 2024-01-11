import { createParamDecorator } from '@nestjs/common';
import { IUser } from '../../types/types';

export const GetUser = createParamDecorator((req): IUser => req.user);
