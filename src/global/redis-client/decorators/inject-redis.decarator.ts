import { Inject } from '@nestjs/common';
import { RedisConstants } from '../constants/redis.client.constants';

export const InjectRedis = (): ReturnType<typeof Inject> =>
  Inject(RedisConstants.client);
