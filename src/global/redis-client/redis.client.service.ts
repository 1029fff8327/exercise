import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisClientService {
  private readonly client: Redis;

  constructor(options: RedisOptions) {
    this.client = new Redis(options);
  }

  async set(key: string, value: string, mode: string, duration: number): Promise<string> {
    if (mode === 'EX') {
      return this.client.set(key, value, mode, duration);
    } else {
      throw new Error(`Unsupported expiration mode: ${mode}`);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
