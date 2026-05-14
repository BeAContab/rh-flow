import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { appRoles, canCreateRole } from "@/lib/roles";
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

    const payload = createUserSchema.parse(await request.json());
    if (!canCreateRole(session.role, payload.role)) {
      return NextResponse.json({ error: "Seu perfil nao pode criar esse nivel de usuario." }, { status: 403 });
    }

    await createUser({
      ...payload,
      createdByUserId: session.userId,
    });

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
