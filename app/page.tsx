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
        <section className="card overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%),linear-gradient(135deg,_#142d55,_#0d1f3c)] px-8 py-14 text-white lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">RH Flow</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
            Central segura para admissao e movimentacoes de pessoal.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Entre com as credenciais liberadas pelo administrador e acompanhe cada formulario com rastreabilidade por usuario.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Acesso aprovado</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Novos usuarios so entram no sistema apos criacao pelo administrador.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Rastreabilidade</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Cada submissao registra quem salvou, quando enviou e qual fluxo foi utilizado.
              </p>
            </div>
          </div>
        </section>

        <LoginForm recaptchaSiteKey={process.env.RECAPTCHA_SITE_KEY} />
      </div>
    </main>
  );
}
