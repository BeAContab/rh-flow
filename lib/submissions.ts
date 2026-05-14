import { desc, eq } from "drizzle-orm";

import { ensureDatabase, getDb, isUsingTurso } from "@/lib/db";
import { submissions } from "@/lib/schema";

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

export async function listRecentSubmissions() {
  await ensureDatabase();
  const db = getDb();

  return db.select().from(submissions).orderBy(desc(submissions.updatedAt)).limit(8);
}

export async function getSubmissionById(id: string) {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  return result[0] ?? null;
}

export function getStorageLabel() {
  return isUsingTurso() ? "Turso" : "LibSQL local";
}
