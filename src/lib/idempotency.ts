import { redis } from "./redis";

export const checkIdempotency = async (key: string): Promise<boolean> => {
  if (!redis) return false;
  const exists = await redis.get(`idempotency:${key}`);
  return !!exists;
};

export const saveIdempotencyKey = async (key: string): Promise<void> => {
  if (!redis) return;
  // Expire idempotency key after 24 hours
  await redis.setex(`idempotency:${key}`, 60 * 60 * 24, "processed");
};
