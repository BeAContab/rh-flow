import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import {
  buildPdfBuffer,
  buildWorkbookBuffer,
  getExportFileName,
} from "@/lib/report-exports";
import { getVisibleSubmissionById } from "@/lib/submissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const submission = await getVisibleSubmissionById(id, session);

  if (!submission) {
    return NextResponse.json({ error: "Registro nao encontrado ou nao autorizado." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format === "xlsx") {
    const buffer = buildWorkbookBuffer(submission);
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${getExportFileName(submission, "xlsx")}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildPdfBuffer(submission);
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${getExportFileName(submission, "pdf")}"`,
        "Content-Type": "application/pdf",
      },
    });
  }

  return NextResponse.json({ error: "Formato de exportacao invalido." }, { status: 400 });
}
