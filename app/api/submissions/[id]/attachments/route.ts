import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import {
  listAttachmentsForSubmission,
  maxAttachmentSizeInBytes,
  saveUploadedFilesForSubmission,
} from "@/lib/attachments";
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

    const { id } = await context.params;
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um arquivo." }, { status: 400 });
    }

    const oversizedFile = files.find((file) => file.size > maxAttachmentSizeInBytes);
    if (oversizedFile) {
      return NextResponse.json({ error: "Cada arquivo deve ter no maximo 4 MB." }, { status: 400 });
    }

    const attachments = await saveUploadedFilesForSubmission(id, files, session);
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
