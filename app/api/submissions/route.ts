import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { saveSubmission } from "@/lib/submissions";

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
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const payload = submissionSchema.parse(await request.json());
    const result = await saveSubmission({
      ...payload,
      actor: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
      },
    });

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
