import { del, get, put } from "@vercel/blob";
import { desc, eq, inArray } from "drizzle-orm";

import {
  allowedAttachmentExtensions,
  allowedAttachmentMimeTypes,
  maxAttachmentsPerSubmission,
  maxAttachmentSizeInBytes,
} from "@/lib/attachment-policy";
import type { SessionPayload } from "@/lib/auth";
import { ensureDatabase, getDb } from "@/lib/db";
import { canEditSubmission, getVisibleSubmissionById } from "@/lib/submissions";
import { attachments } from "@/lib/schema";
const allowedAttachmentExtensionSet = new Set(allowedAttachmentExtensions);

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

export function sanitizeDownloadFileName(fileName: string) {
  return fileName
    .replace(/[\r\n"]/g, "")
    .replace(/[^\p{L}\p{N}._() -]+/gu, "-")
    .trim() || "anexo";
}

function getFileExtension(fileName: string) {
  const normalizedName = fileName.trim().toLowerCase();
  const dotIndex = normalizedName.lastIndexOf(".");
  return dotIndex >= 0 ? normalizedName.slice(dotIndex) : "";
}

export function validateAttachmentFile(file: File) {
  if (file.size > maxAttachmentSizeInBytes) {
    throw new Error("Cada arquivo deve ter no maximo 4 MB.");
  }

  const extension = getFileExtension(file.name || "");
  if (!allowedAttachmentExtensionSet.has(extension as (typeof allowedAttachmentExtensions)[number])) {
    throw new Error("Tipo de arquivo nao permitido. Envie apenas PDF, imagens, DOC, DOCX, XLS ou XLSX.");
  }

  if (file.type && !allowedAttachmentMimeTypes.has(file.type)) {
    throw new Error("O tipo MIME do arquivo nao e permitido para upload.");
  }
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
  const existingAttachments = await listAttachmentsForSubmission(submissionId);

  if (existingAttachments.length + files.length > maxAttachmentsPerSubmission) {
    throw new Error(`Cada relatorio pode ter no maximo ${maxAttachmentsPerSubmission} anexos.`);
  }

  for (const file of files) {
    validateAttachmentFile(file);

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
