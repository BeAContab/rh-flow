import { eq } from "drizzle-orm";

import { ensureDatabase, getDb } from "@/lib/db";
import { apiRateLimits } from "@/lib/schema";

type ApiRateLimitAction =
  | "submission_write"
  | "attachment_upload"
  | "user_create"
  | "user_delete";

type RateLimitScope = "user" | "ip";

type RateLimitKey = {
  key: string;
  scope: RateLimitScope;
};

type LimitConfig = {
  maxHits: number;
  windowMs: number;
  blockDurationMs: number;
};

const actionConfigs: Record<ApiRateLimitAction, Record<RateLimitScope, LimitConfig>> = {
  submission_write: {
    user: { maxHits: 30, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
    ip: { maxHits: 60, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  },
  attachment_upload: {
    user: { maxHits: 20, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
    ip: { maxHits: 40, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  },
  user_create: {
    user: { maxHits: 12, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
    ip: { maxHits: 20, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  },
  user_delete: {
    user: { maxHits: 10, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
    ip: { maxHits: 15, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  },
};

async function getRecord(key: string) {
  await ensureDatabase();
  const db = getDb();
  const result = await db.select().from(apiRateLimits).where(eq(apiRateLimits.key, key)).limit(1);
  return result[0] ?? null;
}

async function upsertRecord(input: {
  key: string;
  hitCount: number;
  windowStartedAt: Date | null;
  blockedUntil: Date | null;
}) {
  await ensureDatabase();
  const db = getDb();

  const existing = await getRecord(input.key);
  const values = {
    key: input.key,
    hitCount: input.hitCount,
    windowStartedAt: input.windowStartedAt,
    blockedUntil: input.blockedUntil,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(apiRateLimits).set(values).where(eq(apiRateLimits.key, input.key));
    return;
  }

  await db.insert(apiRateLimits).values(values);
}

export function buildApiRateLimitKeys(action: ApiRateLimitAction, userId: string, ip: string): RateLimitKey[] {
  return [
    { key: `${action}:user:${userId}`, scope: "user" },
    { key: `${action}:ip:${ip}`, scope: "ip" },
  ];
}

export async function getActiveApiBlock(action: ApiRateLimitAction, keys: RateLimitKey[]) {
  const now = Date.now();
  let blockedUntilTimestamp = 0;

  for (const keyInfo of keys) {
    const record = await getRecord(keyInfo.key);
    const blockedUntil = record?.blockedUntil ? new Date(record.blockedUntil).getTime() : 0;
    if (blockedUntil > now && blockedUntil > blockedUntilTimestamp) {
      blockedUntilTimestamp = blockedUntil;
    }
  }

  if (!blockedUntilTimestamp) {
    return null;
  }

  const userLimit = actionConfigs[action].user;
  return {
    retryAfterSeconds: Math.max(1, Math.ceil((blockedUntilTimestamp - now) / 1000)),
    message: `Muitas requisicoes sensiveis em pouco tempo. Aguarde ${Math.ceil(userLimit.blockDurationMs / 60000)} minutos antes de tentar novamente.`,
  };
}

export async function registerApiHit(action: ApiRateLimitAction, keys: RateLimitKey[]) {
  const now = new Date();
  const nowTimestamp = now.getTime();

  for (const keyInfo of keys) {
    const config = actionConfigs[action][keyInfo.scope];
    const record = await getRecord(keyInfo.key);
    const windowStartedAtTimestamp = record?.windowStartedAt ? new Date(record.windowStartedAt).getTime() : 0;
    const isOutsideWindow = !windowStartedAtTimestamp || nowTimestamp - windowStartedAtTimestamp > config.windowMs;
    const hitCount = isOutsideWindow ? 1 : (record?.hitCount || 0) + 1;
    const windowStartedAt = isOutsideWindow ? now : record?.windowStartedAt || now;
    const blockedUntil =
      hitCount >= config.maxHits
        ? new Date(nowTimestamp + config.blockDurationMs)
        : record?.blockedUntil && new Date(record.blockedUntil).getTime() > nowTimestamp
          ? record.blockedUntil
          : null;

    await upsertRecord({
      key: keyInfo.key,
      hitCount,
      windowStartedAt,
      blockedUntil,
    });
  }
}
