import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession, setSessionCookie } from "@/lib/auth";
import { validateUserCredentials } from "@/lib/users";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!payload.recaptchaToken) {
        return NextResponse.json({ error: "Confirme o reCAPTCHA antes de entrar." }, { status: 400 });
      }

      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: payload.recaptchaToken,
        }),
      });

      const verification = await response.json();
      if (!verification.success) {
        return NextResponse.json({ error: "Falha na validação do reCAPTCHA." }, { status: 400 });
      }
    }

    const user = await validateUserCredentials(payload.email, payload.password);
    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const token = await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Não foi possível entrar.",
      },
      { status: 400 },
    );
  }
}
