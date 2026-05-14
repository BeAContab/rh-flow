import { del, get, put } from "@vercel/blob";
import { desc, eq, inArray } from "drizzle-orm";

import type { SessionPayload } from "@/lib/auth";
import { ensureDatabase, getDb } from "@/lib/db";
import { canEditSubmission, getVisibleSubmissionById } from "@/lib/submissions";
import { attachments } from "@/lib/schema";

export const maxAttachmentSizeInBytes = 4 * 1024 * 1024;

export type AttachmentWithAccess = typeof attachments.$inferSelect;

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function listAttachmentsBySubmissionIds(submissionIds: string[]) {
  if (submissionIds.length === 0) {
    return [];
  }

  await ensureDatabase();
  const db = getDb();

  return db
    .select()
    .from(attachments)
    .where(inArray(attachments.submissionId, submissionIds))
    .orderBy(desc(attachments.createdAt));
}

export async function listAttachmentsForSubmission(submissionId: string) {
  return listAttachmentsBySubmissionIds([submissionId]);
}

export async function getAttachmentById(id: string) {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function saveUploadedFilesForSubmission(
  submissionId: string,
  files: File[],
  session: SessionPayload,
) {
  const submission = await getVisibleSubmissionById(submissionId, session);
  if (!submission) {
    throw new Error("Relatorio nao encontrado ou nao autorizado.");
  }

  if (!canEditSubmission(session, submission)) {
    throw new Error("Voce nao pode anexar documentos a este relatorio.");
  }

  await ensureDatabase();
  const db = getDb();
  const now = new Date();
  const createdAttachments: AttachmentWithAccess[] = [];

  for (const file of files) {
    if (file.size > maxAttachmentSizeInBytes) {
      throw new Error("Cada arquivo deve ter no maximo 4 MB.");
    }

    const safeName = sanitizeFileName(file.name || "documento");
    const pathname = `submissions/${submissionId}/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    });

    const record: AttachmentWithAccess = {
      id: crypto.randomUUID(),
      submissionId,
      fileName: file.name || safeName,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
      uploadedByUserId: session.userId,
      createdAt: now,
    };

    await db.insert(attachments).values(record);
    createdAttachments.push(record);
  }

  return createdAttachments;
}

export async function streamAttachmentDownload(id: string, session: SessionPayload) {
  const attachment = await getAttachmentById(id);
  if (!attachment) {
    return null;
  }

  const submission = await getVisibleSubmissionById(attachment.submissionId, session);
  if (!submission) {
    return null;
  }

  const blob = await get(attachment.blobUrl, {
    access: "private",
  });

  if (!blob || blob.statusCode !== 200) {
    return null;
  }

  return {
    attachment,
    blob,
  };
}

export async function deleteAttachment(id: string, session: SessionPayload) {
  const attachment = await getAttachmentById(id);
  if (!attachment) {
    throw new Error("Anexo nao encontrado.");
  }

  const submission = await getVisibleSubmissionById(attachment.submissionId, session);
  if (!submission) {
    throw new Error("Relatorio nao encontrado ou nao autorizado.");
  }

  if (!canEditSubmission(session, submission)) {
    throw new Error("Voce nao pode apagar anexos deste relatorio.");
  }

  await del(attachment.blobUrl);

  await ensureDatabase();
  const db = getDb();
  await db.delete(attachments).where(eq(attachments.id, id));
}
