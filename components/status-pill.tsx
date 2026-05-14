type StatusPillProps = {
  status: string;
};

export function StatusPill({ status }: StatusPillProps) {
  const submitted = status === "submitted";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        submitted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {submitted ? "Enviado" : "Rascunho"}
    </span>
  );
}
