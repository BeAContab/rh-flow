import { NextResponse } from "next/server";
import { z } from "zod";

import { buildApiRateLimitKeys, getActiveApiBlock, registerApiHit } from "@/lib/api-rate-limit";
import { getCurrentSession } from "@/lib/auth";
import { notifyUserCreated } from "@/lib/notifications";
import { getClientIp } from "@/lib/request-security";
import { appRoles, canCreateRole } from "@/lib/roles";
import { createSecurityEvent } from "@/lib/security-events";
import { createUserAuditLog } from "@/lib/user-audit-logs";
import { createUser } from "@/lib/users";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(appRoles).default("user"),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "admin" && session.role !== "super_user")) {
      return NextResponse.json({ error: "Acesso restrito a usuarios autorizados." }, { status: 403 });
    }

    const clientIp = getClientIp(request);
    const rateLimitKeys = buildApiRateLimitKeys("user_create", session.userId, clientIp);
    const activeBlock = await getActiveApiBlock("user_create", rateLimitKeys);
    if (activeBlock) {
      await createSecurityEvent({
        eventType: "api_rate_limited",
        actorUserId: session.userId,
        actorEmail: session.email,
        actorRole: session.role,
        ipAddress: clientIp,
        targetKey: "user_create",
        details: { retryAfterSeconds: activeBlock.retryAfterSeconds },
      });
      return NextResponse.json(
        { error: activeBlock.message },
        { status: 429, headers: { "Retry-After": String(activeBlock.retryAfterSeconds) } },
      );
    }

    const payload = createUserSchema.parse(await request.json());
    if (!canCreateRole(session.role, payload.role)) {
      return NextResponse.json({ error: "Seu perfil nao pode criar esse nivel de usuario." }, { status: 403 });
    }

    const createdUser = await createUser({
      ...payload,
      createdByUserId: session.userId,
    });

    await createUserAuditLog({
      action: "user_created",
      actor: {
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      target: {
        userId: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
    await registerApiHit("user_create", rateLimitKeys);

    try {
      await notifyUserCreated({
        actor: {
          name: session.name,
          email: session.email,
          role: session.role,
        },
        target: {
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
      });
    } catch (error) {
      console.error("Falha ao enviar notificacao de novo usuario:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel criar o usuario.",
      },
      { status: 400 },
    );
  }
}
