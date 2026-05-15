import { NextResponse } from "next/server";

import { buildApiRateLimitKeys, getActiveApiBlock, registerApiHit } from "@/lib/api-rate-limit";
import { getCurrentSession } from "@/lib/auth";
import { getClientIp } from "@/lib/request-security";
import { canDeleteRole, type AppRole } from "@/lib/roles";
import { createSecurityEvent } from "@/lib/security-events";
import { createUserAuditLog } from "@/lib/user-audit-logs";
import { deleteUser, findUserById } from "@/lib/users";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "admin" && session.role !== "super_user")) {
      return NextResponse.json({ error: "Acesso restrito a usuarios autorizados." }, { status: 403 });
    }

    const clientIp = getClientIp(_);
    const rateLimitKeys = buildApiRateLimitKeys("user_delete", session.userId, clientIp);
    const activeBlock = await getActiveApiBlock("user_delete", rateLimitKeys);
    if (activeBlock) {
      await createSecurityEvent({
        eventType: "api_rate_limited",
        actorUserId: session.userId,
        actorEmail: session.email,
        actorRole: session.role,
        ipAddress: clientIp,
        targetKey: "user_delete",
        details: { retryAfterSeconds: activeBlock.retryAfterSeconds },
      });
      return NextResponse.json(
        { error: activeBlock.message },
        { status: 429, headers: { "Retry-After": String(activeBlock.retryAfterSeconds) } },
      );
    }

    const { id } = await context.params;
    if (session.userId === id) {
      return NextResponse.json({ error: "Voce nao pode excluir o proprio usuario." }, { status: 403 });
    }

    const targetUser = await findUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    }

    const targetRole = targetUser.role as AppRole;
    if (!canDeleteRole(session.role, targetRole)) {
      return NextResponse.json({ error: "Seu perfil nao pode excluir esse nivel de usuario." }, { status: 403 });
    }

    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    }

    await createUserAuditLog({
      action: "user_deleted",
      actor: {
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      target: {
        userId: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role as AppRole,
      },
    });
    await registerApiHit("user_delete", rateLimitKeys);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel excluir o usuario.",
      },
      { status: 400 },
    );
  }
}
