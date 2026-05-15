import { NextResponse } from "next/server";
import { z } from "zod";

import { buildApiRateLimitKeys, getActiveApiBlock, registerApiHit } from "@/lib/api-rate-limit";
import { assertSubmissionCreateQuota } from "@/lib/activity-quotas";
import { getCurrentSession } from "@/lib/auth";
import { notifySubmissionCreated } from "@/lib/notifications";
import { getClientIp } from "@/lib/request-security";
import { createSecurityEvent } from "@/lib/security-events";
import { parseAndValidateSubmissionRequestBody } from "@/lib/submission-security";
import { canEditSubmission, getSubmissionById, saveSubmission } from "@/lib/submissions";

const submissionSchema = z.object({
  id: z.string().optional(),
  flowType: z.enum(["admissao", "movimentacoes"]),
  status: z.enum(["draft", "submitted"]),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const rateLimitKeys = buildApiRateLimitKeys("submission_write", session.userId, clientIp);
    const activeBlock = await getActiveApiBlock("submission_write", rateLimitKeys);
    if (activeBlock) {
      await createSecurityEvent({
        eventType: "api_rate_limited",
        actorUserId: session.userId,
        actorEmail: session.email,
        actorRole: session.role,
        ipAddress: clientIp,
        targetKey: "submission_write",
        details: { retryAfterSeconds: activeBlock.retryAfterSeconds },
      });
      return NextResponse.json(
        { error: activeBlock.message },
        { status: 429, headers: { "Retry-After": String(activeBlock.retryAfterSeconds) } },
      );
    }

    const rawBody = await request.text();
    const payload = submissionSchema.parse(parseAndValidateSubmissionRequestBody(rawBody));
    if (!payload.id) {
      try {
        await assertSubmissionCreateQuota(session.userId, session.role);
      } catch (error) {
        await createSecurityEvent({
          eventType: "quota_reached",
          actorUserId: session.userId,
          actorEmail: session.email,
          actorRole: session.role,
          ipAddress: clientIp,
          targetKey: "submission_create_daily_quota",
          details: { message: error instanceof Error ? error.message : "Quota excedida" },
        });
        throw error;
      }
    }
    if (payload.id) {
      const existing = await getSubmissionById(payload.id);
      if (!existing) {
        return NextResponse.json({ error: "Registro nao encontrado." }, { status: 404 });
      }

      if (!canEditSubmission(session, existing)) {
        return NextResponse.json({ error: "Voce nao pode editar este formulario." }, { status: 403 });
      }
    }

    const result = await saveSubmission({
      ...payload,
      actor: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
      },
    });
    await registerApiHit("submission_write", rateLimitKeys);

    if (result.created) {
      try {
        await notifySubmissionCreated({
          actor: {
            name: session.name,
            email: session.email,
            role: session.role,
          },
          flowType: payload.flowType,
          status: payload.status,
          submissionId: result.id,
          employerName: result.employerName,
          employeeName: result.employeeName,
        });
      } catch (error) {
        console.error("Falha ao enviar notificacao de novo formulario:", error);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel salvar a submissao.",
      },
      { status: 400 },
    );
  }
}
