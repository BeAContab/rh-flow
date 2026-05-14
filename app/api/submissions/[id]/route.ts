import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { deleteSubmission, getVisibleSubmissionById } from "@/lib/submissions";

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
    return NextResponse.json({ error: "Registro nao encontrado ou nao autorizado." }, { status: 404 });
  }

  return NextResponse.json(submission);
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Apenas ADMIN pode apagar registros." }, { status: 403 });
  }

  const { id } = await context.params;
  const submission = await getVisibleSubmissionById(id, session);

  if (!submission) {
    return NextResponse.json({ error: "Registro nao encontrado." }, { status: 404 });
  }

  await deleteSubmission(id);
  return NextResponse.json({ ok: true });
}
