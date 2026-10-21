import type { RedisClient } from "bun";

let client: RedisClient | null = null;

export function usersCacheKey(): string {
  const prefix = process.env.REDIS_KEY_PREFIX ?? "test:";
  return `${prefix}users:all`;
}

/** When `REDIS_URL` is unset, no client is used (never import the default `redis` singleton). */
export function getRedisClient(): RedisClient | null {
  return client;
}

/** Ping at startup when `REDIS_URL` is set; throws on failure (fail loud). */
export async function initRedisAtStartup(): Promise<void> {
  if (!process.env.REDIS_URL) {
    client = null;
    return;
  }
  const { redis } = await import("bun");
  await redis.ping();
  client = redis;
}
