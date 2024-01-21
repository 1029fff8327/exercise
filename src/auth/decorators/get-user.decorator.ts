import { createParamDecorator } from '@nestjs/common';
import { IUser } from '../../types/user.types';

export const GetUser = createParamDecorator((req): IUser => req.user);
