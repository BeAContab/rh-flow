"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteSubmissionButtonProps = {
  submissionId: string;
};

export function DeleteSubmissionButton({ submissionId }: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Nao foi possivel apagar o relatorio.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
        onClick={() => setOpen(true)}
        type="button"
      >
        Apagar
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
              Exclusao de relatorio
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              Confirmar exclusao?
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              O relatorio e os anexos vinculados a ele serao removidos. Esta acao nao pode ser desfeita.
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                disabled={loading}
                onClick={handleDelete}
                type="button"
              >
                {loading ? "Apagando..." : "Apagar relatorio"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
