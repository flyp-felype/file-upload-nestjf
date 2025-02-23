import { RedisOptions } from 'bullmq';

export function createRedisConnection(): RedisOptions {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
  };
}
