import { del } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";

import type { SessionPayload } from "@/lib/auth";
import { ensureDatabase, getDb, isUsingTurso } from "@/lib/db";
import type { AppRole } from "@/lib/roles";
import { attachments, submissions, users } from "@/lib/schema";

type SubmissionActor = {
  userId: string;
  userName: string;
  userEmail: string;
};

export type SaveSubmissionInput = {
  id?: string;
  flowType: "admissao" | "movimentacoes";
  status: "draft" | "submitted";
  payload: Record<string, unknown>;
  actor: SubmissionActor;
};

export type SubmissionWithCreatorRole = typeof submissions.$inferSelect & {
  creatorRole: AppRole | null;
};

function normalizeSubmissionResult(result: {
  submissions: typeof submissions.$inferSelect;
  users: typeof users.$inferSelect | null;
}): SubmissionWithCreatorRole {
  return {
    ...result.submissions,
    creatorRole: (result.users?.role as AppRole | undefined) || null,
  };
}

function canViewSubmission(session: SessionPayload, submission: SubmissionWithCreatorRole) {
  if (session.role === "admin") {
    return true;
  }

  if (session.role === "user") {
    return submission.createdByUserId === session.userId;
  }

  return (
    submission.createdByUserId === session.userId ||
    submission.creatorRole === "user" ||
    submission.creatorRole === "super_user"
  );
}

export function canEditSubmission(session: SessionPayload, submission: SubmissionWithCreatorRole) {
  return session.role === "admin" || submission.createdByUserId === session.userId;
}

export async function saveSubmission(input: SaveSubmissionInput) {
  await ensureDatabase();
  const db = getDb();

  const now = new Date();
  const id = input.id || crypto.randomUUID();
  const employerName = String(input.payload.employerName || input.payload.companyName || "");
  const employeeName = String(
    input.payload.employeeName || input.payload.fullName || input.payload.workerName || "",
  );
  const employeeDocument = String(
    input.payload.cpf || input.payload.employeeDocument || input.payload.registration || "",
  );

  const existing = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(submissions)
      .set({
        status: input.status,
        employerName,
        employeeName,
        employeeDocument,
        createdByUserId: input.actor.userId,
        createdByUserName: input.actor.userName,
        createdByUserEmail: input.actor.userEmail,
        payload: input.payload,
        updatedAt: now,
      })
      .where(eq(submissions.id, id));
  } else {
    await db.insert(submissions).values({
      id,
      flowType: input.flowType,
      status: input.status,
      employerName,
      employeeName,
      employeeDocument,
      createdByUserId: input.actor.userId,
      createdByUserName: input.actor.userName,
      createdByUserEmail: input.actor.userEmail,
      payload: input.payload,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { id };
}

export async function getSubmissionById(id: string) {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select()
    .from(submissions)
    .leftJoin(users, eq(submissions.createdByUserId, users.id))
    .where(eq(submissions.id, id))
    .limit(1);

  return result[0] ? normalizeSubmissionResult(result[0]) : null;
}

export async function getVisibleSubmissionById(id: string, session: SessionPayload) {
  const submission = await getSubmissionById(id);
  if (!submission) {
    return null;
  }

  return canViewSubmission(session, submission) ? submission : null;
}

export async function listVisibleSubmissions(session: SessionPayload) {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select()
    .from(submissions)
    .leftJoin(users, eq(submissions.createdByUserId, users.id))
    .orderBy(desc(submissions.updatedAt));

  return result.map(normalizeSubmissionResult).filter((submission) => canViewSubmission(session, submission));
}

export async function listRecentSubmissionsForSession(session: SessionPayload) {
  const visibleSubmissions = await listVisibleSubmissions(session);
  return visibleSubmissions.slice(0, 8);
}

export async function deleteSubmission(id: string) {
  await ensureDatabase();
  const db = getDb();

  const linkedAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.submissionId, id));

  for (const attachment of linkedAttachments) {
    await del(attachment.blobUrl);
  }

  await db.delete(attachments).where(eq(attachments.submissionId, id));
  await db.delete(submissions).where(eq(submissions.id, id));
}

export function getStorageLabel() {
  return isUsingTurso() ? "Turso" : "LibSQL local";
}
