import { NextResponse } from "next/server";

import { getSubmissionById } from "@/lib/submissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: "Registro nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(submission);
}
