import { eq } from "drizzle-orm";

import { ensureDatabase, getDb } from "@/lib/db";
import { authRateLimits } from "@/lib/schema";

const emailWindowMs = 15 * 60 * 1000;
const ipWindowMs = 15 * 60 * 1000;
const emailMaxFailures = 5;
const ipMaxFailures = 12;
const blockDurationMs = 15 * 60 * 1000;

type AuthLimitScope = "email" | "ip";

type RateLimitKey = {
  key: string;
  scope: AuthLimitScope;
};

function getLimitConfig(scope: AuthLimitScope) {
  if (scope === "email") {
    return {
      maxFailures: emailMaxFailures,
      windowMs: emailWindowMs,
    };
  }

  return {
    maxFailures: ipMaxFailures,
    windowMs: ipWindowMs,
  };
}

async function getRateLimitRecord(key: string) {
  await ensureDatabase();
  const db = getDb();
  const result = await db.select().from(authRateLimits).where(eq(authRateLimits.key, key)).limit(1);
  return result[0] ?? null;
}

async function upsertRateLimitRecord(input: {
  key: string;
  failedCount: number;
  firstFailedAt: Date | null;
  lastFailedAt: Date | null;
  blockedUntil: Date | null;
}) {
  await ensureDatabase();
  const db = getDb();

  const existing = await getRateLimitRecord(input.key);
  const values = {
    key: input.key,
    failedCount: input.failedCount,
    firstFailedAt: input.firstFailedAt,
    lastFailedAt: input.lastFailedAt,
    blockedUntil: input.blockedUntil,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(authRateLimits).set(values).where(eq(authRateLimits.key, input.key));
    return;
  }

  await db.insert(authRateLimits).values(values);
}

async function resetRateLimitRecord(key: string) {
  await ensureDatabase();
  const db = getDb();

  await db.delete(authRateLimits).where(eq(authRateLimits.key, key));
}

export function buildAuthRateLimitKeys(email: string, ip: string): RateLimitKey[] {
  const normalizedEmail = email.trim().toLowerCase();
  return [
    { key: `email:${normalizedEmail}`, scope: "email" },
    { key: `ip:${ip}`, scope: "ip" },
  ];
}

export async function getActiveAuthBlock(keys: RateLimitKey[]) {
  const now = Date.now();
  let blockedUntilTimestamp = 0;

  for (const keyInfo of keys) {
    const record = await getRateLimitRecord(keyInfo.key);
    const blockedUntil = record?.blockedUntil ? new Date(record.blockedUntil).getTime() : 0;

    if (blockedUntil > now && blockedUntil > blockedUntilTimestamp) {
      blockedUntilTimestamp = blockedUntil;
    }
  }

  if (!blockedUntilTimestamp) {
    return null;
  }

  return {
    retryAfterSeconds: Math.max(1, Math.ceil((blockedUntilTimestamp - now) / 1000)),
  };
}

export async function registerFailedAuthAttempt(keys: RateLimitKey[]) {
  const now = new Date();
  const nowTimestamp = now.getTime();

  for (const keyInfo of keys) {
    const config = getLimitConfig(keyInfo.scope);
    const record = await getRateLimitRecord(keyInfo.key);
    const firstFailedAtTimestamp = record?.firstFailedAt ? new Date(record.firstFailedAt).getTime() : 0;
    const isOutsideWindow = !firstFailedAtTimestamp || nowTimestamp - firstFailedAtTimestamp > config.windowMs;
    const failedCount = isOutsideWindow ? 1 : (record?.failedCount || 0) + 1;
    const firstFailedAt = isOutsideWindow ? now : record?.firstFailedAt || now;
    const blockedUntil =
      failedCount >= config.maxFailures
        ? new Date(nowTimestamp + blockDurationMs)
        : record?.blockedUntil && new Date(record.blockedUntil).getTime() > nowTimestamp
          ? record.blockedUntil
          : null;

    await upsertRateLimitRecord({
      key: keyInfo.key,
      failedCount,
      firstFailedAt,
      lastFailedAt: now,
      blockedUntil,
    });
  }
}

export async function clearAuthRateLimit(keys: RateLimitKey[]) {
  for (const keyInfo of keys) {
    await resetRateLimitRecord(keyInfo.key);
  }
}
