import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildAuthRateLimitKeys,
  clearAuthRateLimit,
  getActiveAuthBlock,
  registerFailedAuthAttempt,
} from "@/lib/auth-rate-limit";
import { createSession, setSessionCookie } from "@/lib/auth";
import { fetchWithSecurityTimeout, getClientIp } from "@/lib/request-security";
import type { AppRole } from "@/lib/roles";
import { createSecurityEvent } from "@/lib/security-events";
import { validateUserCredentials } from "@/lib/users";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const clientIp = getClientIp(request);
    const rateLimitKeys = buildAuthRateLimitKeys(payload.email, clientIp);
    const activeBlock = await getActiveAuthBlock(rateLimitKeys);

    if (activeBlock) {
      await createSecurityEvent({
        eventType: "login_blocked",
        actorEmail: payload.email,
        ipAddress: clientIp,
        targetKey: "auth_login",
        details: { retryAfterSeconds: activeBlock.retryAfterSeconds },
      });
      return NextResponse.json(
        {
          error: "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(activeBlock.retryAfterSeconds),
          },
        },
      );
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!payload.recaptchaToken) {
        await registerFailedAuthAttempt(rateLimitKeys);
        await createSecurityEvent({
          eventType: "recaptcha_failure",
          actorEmail: payload.email,
          ipAddress: clientIp,
          targetKey: "auth_login",
          details: { reason: "missing_token" },
        });
        return NextResponse.json({ error: "Confirme o reCAPTCHA antes de entrar." }, { status: 400 });
      }

      try {
        const response = await fetchWithSecurityTimeout("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: payload.recaptchaToken,
          }),
        });

        const verification = await response.json();
        if (!verification.success) {
          await registerFailedAuthAttempt(rateLimitKeys);
          await createSecurityEvent({
            eventType: "recaptcha_failure",
            actorEmail: payload.email,
            ipAddress: clientIp,
            targetKey: "auth_login",
            details: { reason: "verification_failed" },
          });
          return NextResponse.json({ error: "Falha na validacao do reCAPTCHA." }, { status: 400 });
        }
      } catch {
        await createSecurityEvent({
          eventType: "recaptcha_unavailable",
          actorEmail: payload.email,
          ipAddress: clientIp,
          targetKey: "auth_login",
        });
        return NextResponse.json(
          { error: "Nao foi possivel validar o reCAPTCHA agora. Tente novamente em instantes." },
          { status: 503 },
        );
      }
    }

    const user = await validateUserCredentials(payload.email, payload.password);
    if (!user) {
      await registerFailedAuthAttempt(rateLimitKeys);
      await createSecurityEvent({
        eventType: "login_failure",
        actorEmail: payload.email,
        ipAddress: clientIp,
        targetKey: "auth_login",
      });
      return NextResponse.json({ error: "E-mail ou senha invalidos." }, { status: 401 });
    }

    const token = await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AppRole,
      status: user.status,
    });

    await clearAuthRateLimit(rateLimitKeys);
    await createSecurityEvent({
      eventType: "login_success",
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role as AppRole,
      ipAddress: clientIp,
      targetKey: "auth_login",
    });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel entrar.",
      },
      { status: 400 },
    );
  }
}
