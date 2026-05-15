import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getCurrentSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="container-page flex min-h-[calc(100vh-84px)] items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section
          className="overflow-hidden rounded-[1.25rem] border border-slate-800 px-8 py-14 text-white shadow-[0_16px_40px_rgba(13,33,67,0.18)] lg:px-12"
          style={{
            backgroundColor: "#0f2346",
            backgroundImage:
              "radial-gradient(circle at top left, rgba(255,255,255,0.24), transparent 42%), linear-gradient(135deg, #142d55, #0b1b36)",
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-100">RH Flow</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Gerencie admissoes e movimentacoes com seguranca e rastreabilidade.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-50/95">
            Acesse com seu usuario autorizado e acompanhe cada formulario com historico, responsabilidade e visibilidade sobre cada etapa.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/15 bg-white/12 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Acesso controlado</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/90">
                Novos usuarios entram apenas com liberacao do administrador, mantendo o ambiente protegido desde o primeiro acesso.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/15 bg-white/12 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Rastreabilidade</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/90">
                Cada submissao registra responsavel, horario e fluxo utilizado para facilitar auditoria e acompanhamento.
              </p>
            </div>
          </div>
        </section>

        <LoginForm recaptchaSiteKey={process.env.RECAPTCHA_SITE_KEY} />
      </div>
    </main>
  );
}
