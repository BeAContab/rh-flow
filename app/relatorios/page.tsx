import { listAttachmentsBySubmissionIds } from "@/lib/attachments";
import { ReportsTable } from "@/components/reports-table";
import { requireSession } from "@/lib/auth";
import type { AttachmentRecord } from "@/lib/schema";
import { listVisibleSubmissions } from "@/lib/submissions";

export default async function ReportsPage() {
  const session = await requireSession();
  const submissions = await listVisibleSubmissions(session);
  const attachments = await listAttachmentsBySubmissionIds(submissions.map((submission) => submission.id));
  const attachmentsBySubmissionId = attachments.reduce<Record<string, AttachmentRecord[]>>(
    (grouped, attachment) => {
      if (!grouped[attachment.submissionId]) {
        grouped[attachment.submissionId] = [];
      }

      grouped[attachment.submissionId].push(attachment);
      return grouped;
    },
    {},
  );
  const admissionReports = submissions.filter((submission) => submission.flowType === "admissao");
  const movementReports = submissions.filter((submission) => submission.flowType === "movimentacoes");

  return (
    <main className="container-page py-10">
      <section className="card overflow-hidden">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%),linear-gradient(135deg,_#142d55,_#0d1f3c)] px-8 py-14 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
              Relatorios operacionais
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
              Visualize os formularios preenchidos por tipo de fluxo.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Os dados exibidos abaixo seguem o nivel de permissao do usuario logado, com exportacao em XLSX e PDF.
            </p>
          </div>

          <div className="grid gap-3 self-end">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Admissao</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {admissionReports.length} relatorio(s) visivel(is) no momento.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Movimentacoes</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {movementReports.length} relatorio(s) visivel(is) no momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-6">
        <ReportsTable
          attachmentsBySubmissionId={attachmentsBySubmissionId}
          currentRole={session.role}
          emptyMessage="Nenhum relatorio de admissao disponivel para este perfil."
          submissions={admissionReports}
          title="Relatorios de admissao"
        />
        <ReportsTable
          attachmentsBySubmissionId={attachmentsBySubmissionId}
          currentRole={session.role}
          emptyMessage="Nenhum relatorio de movimentacoes disponivel para este perfil."
          submissions={movementReports}
          title="Relatorios de movimentacoes"
        />
      </div>
    </main>
  );
}
