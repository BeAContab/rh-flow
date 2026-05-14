import Link from "next/link";

import { DeleteSubmissionButton } from "@/components/delete-submission-button";
import type { AttachmentRecord, SubmissionRecord } from "@/lib/schema";
import type { AppRole } from "@/lib/roles";
import { getRoleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";

type ReportRow = SubmissionRecord & {
  creatorRole: AppRole | null;
};

type ReportsTableProps = {
  attachmentsBySubmissionId: Record<string, AttachmentRecord[]>;
  currentRole: AppRole;
  emptyMessage: string;
  submissions: ReportRow[];
  title: string;
};

export function ReportsTable({
  attachmentsBySubmissionId,
  currentRole,
  emptyMessage,
  submissions,
  title,
}: ReportsTableProps) {
  const canSeeCreator = currentRole !== "user";
  const canManageData = currentRole === "admin";

  return (
    <section className="card p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Relatorios
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Empregador</th>
                <th className="py-3 pr-4 font-medium">Colaborador</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Anexos</th>
                {canSeeCreator ? <th className="py-3 pr-4 font-medium">Responsavel</th> : null}
                <th className="py-3 pr-4 font-medium">Atualizado</th>
                <th className="py-3 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const rowAttachments = attachmentsBySubmissionId[submission.id] || [];

                return (
                  <tr key={submission.id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-4 pr-4">{submission.employerName || "-"}</td>
                    <td className="py-4 pr-4">{submission.employeeName || "-"}</td>
                    <td className="py-4 pr-4">
                      <StatusPill status={submission.status} />
                    </td>
                    <td className="py-4 pr-4">
                      {rowAttachments.length === 0 ? (
                        <span className="text-slate-500">Sem anexos</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {rowAttachments.map((attachment) => (
                            <Link
                              key={attachment.id}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              href={`/api/attachments/${attachment.id}`}
                            >
                              {attachment.fileName}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    {canSeeCreator ? (
                      <td className="py-4 pr-4">
                        <div className="font-medium text-slate-900">
                          {submission.createdByUserName || submission.createdByUserEmail || "-"}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {submission.creatorRole ? getRoleLabel(submission.creatorRole) : "-"}
                        </div>
                      </td>
                    ) : null}
                    <td className="py-4 pr-4">{formatDate(String(submission.updatedAt))}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          className="text-sm font-medium text-slate-900 transition hover:text-slate-700"
                          href={`/api/submissions/${submission.id}/export?format=xlsx`}
                        >
                          XLSX
                        </Link>
                        <Link
                          className="text-sm font-medium text-slate-900 transition hover:text-slate-700"
                          href={`/api/submissions/${submission.id}/export?format=pdf`}
                        >
                          PDF
                        </Link>
                        {canManageData ? (
                          <Link
                            className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                            href={`/relatorios/${submission.id}/editar`}
                          >
                            Editar
                          </Link>
                        ) : null}
                        {canManageData ? <DeleteSubmissionButton submissionId={submission.id} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
