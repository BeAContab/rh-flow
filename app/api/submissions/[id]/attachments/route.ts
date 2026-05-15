import { NextResponse } from "next/server";

import {
  allowedAttachmentExtensions,
  maxAttachmentsPerSubmission,
  maxAttachmentSizeInBytes,
  maxFilesPerUpload,
} from "@/lib/attachment-policy";
import { buildApiRateLimitKeys, getActiveApiBlock, registerApiHit } from "@/lib/api-rate-limit";
import { assertAttachmentUploadQuota } from "@/lib/activity-quotas";
import { getCurrentSession } from "@/lib/auth";
import {
  listAttachmentsForSubmission,
  saveUploadedFilesForSubmission,
  validateAttachmentFile,
} from "@/lib/attachments";
import { getClientIp } from "@/lib/request-security";
import { createSecurityEvent } from "@/lib/security-events";
import { getVisibleSubmissionById } from "@/lib/submissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const submission = await getVisibleSubmissionById(id, session);
  if (!submission) {
    return NextResponse.json({ error: "Relatorio nao encontrado ou nao autorizado." }, { status: 404 });
  }

  const attachments = await listAttachmentsForSubmission(id);
  return NextResponse.json({ attachments });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const rateLimitKeys = buildApiRateLimitKeys("attachment_upload", session.userId, clientIp);
    const activeBlock = await getActiveApiBlock("attachment_upload", rateLimitKeys);
    if (activeBlock) {
      await createSecurityEvent({
        eventType: "api_rate_limited",
        actorUserId: session.userId,
        actorEmail: session.email,
        actorRole: session.role,
        ipAddress: clientIp,
        targetKey: "attachment_upload",
        details: { retryAfterSeconds: activeBlock.retryAfterSeconds },
      });
      return NextResponse.json(
        { error: activeBlock.message },
        { status: 429, headers: { "Retry-After": String(activeBlock.retryAfterSeconds) } },
      );
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um arquivo." }, { status: 400 });
    }

    if (files.length > maxFilesPerUpload) {
      return NextResponse.json(
        { error: `Envie no maximo ${maxFilesPerUpload} arquivos por vez.` },
        { status: 400 },
      );
    }

    const currentAttachments = await listAttachmentsForSubmission(id);
    if (currentAttachments.length + files.length > maxAttachmentsPerSubmission) {
      return NextResponse.json(
        { error: `Cada relatorio pode ter no maximo ${maxAttachmentsPerSubmission} anexos.` },
        { status: 400 },
      );
    }

    try {
      await assertAttachmentUploadQuota(session.userId, session.role, files.length);
    } catch (error) {
      await createSecurityEvent({
        eventType: "quota_reached",
        actorUserId: session.userId,
        actorEmail: session.email,
        actorRole: session.role,
        ipAddress: clientIp,
        targetKey: "attachment_upload_daily_quota",
        details: { message: error instanceof Error ? error.message : "Quota excedida" },
      });
      throw error;
    }

    for (const file of files) {
      if (file.size > maxAttachmentSizeInBytes) {
        return NextResponse.json({ error: "Cada arquivo deve ter no maximo 4 MB." }, { status: 400 });
      }

      try {
        validateAttachmentFile(file);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : `Tipos permitidos: ${allowedAttachmentExtensions.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    const attachments = await saveUploadedFilesForSubmission(id, files, session);
    await registerApiHit("attachment_upload", rateLimitKeys);
    return NextResponse.json({ attachments });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel enviar os anexos.",
      },
      { status: 400 },
    );
  }
}
