import type { AppRole } from "@/lib/roles";
import { ensureDatabase, getDb } from "@/lib/db";
import { securityEvents } from "@/lib/schema";

export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "login_blocked"
  | "recaptcha_failure"
  | "recaptcha_unavailable"
  | "api_rate_limited"
  | "quota_reached";

type SecurityEventInput = {
  eventType: SecurityEventType;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: AppRole | null;
  ipAddress?: string | null;
  targetKey?: string | null;
  details?: Record<string, unknown> | null;
};

export async function createSecurityEvent(input: SecurityEventInput) {
  await ensureDatabase();
  const db = getDb();

  await db.insert(securityEvents).values({
    id: crypto.randomUUID(),
    eventType: input.eventType,
    actorUserId: input.actorUserId || null,
    actorEmail: input.actorEmail || null,
    actorRole: input.actorRole || null,
    ipAddress: input.ipAddress || null,
    targetKey: input.targetKey || null,
    details: input.details || null,
    createdAt: new Date(),
  });
}
