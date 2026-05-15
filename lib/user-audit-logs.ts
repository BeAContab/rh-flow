import { desc } from "drizzle-orm";

import type { AppRole } from "@/lib/roles";
import { ensureDatabase, getDb } from "@/lib/db";
import { userAuditLogs } from "@/lib/schema";

export type UserAuditAction = "user_created" | "user_deleted";

type AuditActor = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
};

type AuditTarget = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
};

type CreateUserAuditLogInput = {
  action: UserAuditAction;
  actor: AuditActor;
  target: AuditTarget;
};

export async function createUserAuditLog(input: CreateUserAuditLogInput) {
  await ensureDatabase();
  const db = getDb();

  await db.insert(userAuditLogs).values({
    id: crypto.randomUUID(),
    action: input.action,
    actorUserId: input.actor.userId,
    actorName: input.actor.name,
    actorEmail: input.actor.email,
    actorRole: input.actor.role,
    targetUserId: input.target.userId,
    targetName: input.target.name,
    targetEmail: input.target.email,
    targetRole: input.target.role,
    createdAt: new Date(),
  });
}

export async function listUserAuditLogs() {
  await ensureDatabase();
  const db = getDb();

  return db.select().from(userAuditLogs).orderBy(desc(userAuditLogs.createdAt));
}
