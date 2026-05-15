import { and, eq, gte } from "drizzle-orm";

import type { AppRole } from "@/lib/roles";
import { ensureDatabase, getDb } from "@/lib/db";
import { attachments, submissions } from "@/lib/schema";

const submissionDailyQuotaByRole: Record<AppRole, number> = {
  admin: 120,
  super_user: 60,
  user: 25,
};

const attachmentDailyQuotaByRole: Record<AppRole, number> = {
  admin: 200,
  super_user: 100,
  user: 40,
};

function getStartOfDay() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export async function assertSubmissionCreateQuota(userId: string, role: AppRole) {
  await ensureDatabase();
  const db = getDb();

  const startOfDay = getStartOfDay();
  const todaysSubmissions = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.createdByUserId, userId), gte(submissions.createdAt, startOfDay)));

  const limit = submissionDailyQuotaByRole[role];
  if (todaysSubmissions.length >= limit) {
    throw new Error(`Limite diario de ${limit} novos formularios atingido para o seu perfil.`);
  }
}

export async function assertAttachmentUploadQuota(userId: string, role: AppRole, filesToUpload: number) {
  await ensureDatabase();
  const db = getDb();

  const startOfDay = getStartOfDay();
  const todaysUploads = await db
    .select({ id: attachments.id })
    .from(attachments)
    .where(and(eq(attachments.uploadedByUserId, userId), gte(attachments.createdAt, startOfDay)));

  const limit = attachmentDailyQuotaByRole[role];
  if (todaysUploads.length + filesToUpload > limit) {
    throw new Error(`Limite diario de ${limit} anexos atingido para o seu perfil.`);
  }
}
