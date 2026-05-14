import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import type { AppRole } from "@/lib/roles";
import type { SubmissionRecord } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

type RecentSubmissionsProps = {
  currentRole: AppRole;
  submissions: Array<SubmissionRecord & { creatorRole: AppRole | null }>;
};

export function RecentSubmissions({ currentRole, submissions }: RecentSubmissionsProps) {
  const canSeeCreator = currentRole !== "user";

  return (
    <section className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Acompanhamento
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Registros recentes</h2>
        </div>
        <Link className="text-sm font-semibold text-slate-900 transition hover:text-slate-700" href="/relatorios">
          Ver relatorios
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Nenhum formulario salvo ainda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Fluxo</th>
                <th className="py-3 pr-4 font-medium">Empregador</th>
                <th className="py-3 pr-4 font-medium">Colaborador</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                {canSeeCreator ? <th className="py-3 pr-4 font-medium">Responsavel</th> : null}
                <th className="py-3 font-medium">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-4 pr-4 capitalize">
                    <Link
                      className="font-medium text-slate-900 hover:text-slate-700"
                      href={`/${submission.flowType}`}
                    >
                      {submission.flowType === "admissao" ? "Admissao" : "Movimentacoes"}
                    </Link>
                  </td>
                  <td className="py-4 pr-4">{submission.employerName || "-"}</td>
                  <td className="py-4 pr-4">{submission.employeeName || "-"}</td>
                  <td className="py-4 pr-4">
                    <StatusPill status={submission.status} />
                  </td>
                  {canSeeCreator ? (
                    <td className="py-4 pr-4">{submission.createdByUserName || submission.createdByUserEmail || "-"}</td>
                  ) : null}
                  <td className="py-4">{formatDate(String(submission.updatedAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
