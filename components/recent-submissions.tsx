import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { SubmissionRecord } from "@/lib/schema";
import { StatusPill } from "@/components/status-pill";

type RecentSubmissionsProps = {
  submissions: SubmissionRecord[];
};

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <section className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Banco de dados
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Registros recentes</h2>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Nenhum formulário salvo ainda.
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
                      {submission.flowType === "admissao" ? "Admissão" : "Movimentações"}
                    </Link>
                  </td>
                  <td className="py-4 pr-4">{submission.employerName || "-"}</td>
                  <td className="py-4 pr-4">{submission.employeeName || "-"}</td>
                  <td className="py-4 pr-4">
                    <StatusPill status={submission.status} />
                  </td>
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
