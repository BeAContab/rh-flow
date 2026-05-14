import { NextResponse } from "next/server";

import { deleteAttachment, streamAttachmentDownload } from "@/lib/attachments";
import { getCurrentSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await streamAttachmentDownload(id, session);
  if (!result) {
    return NextResponse.json({ error: "Anexo nao encontrado ou nao autorizado." }, { status: 404 });
  }

  return new NextResponse(result.blob.stream, {
    headers: {
      "Content-Disposition": `attachment; filename="${result.attachment.fileName}"`,
      "Content-Type": result.attachment.contentType,
    },
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteAttachment(id, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel apagar o anexo.",
      },
      { status: 400 },
    );
  }
}
