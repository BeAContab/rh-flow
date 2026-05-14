import Link from "next/link";

import { RecentSubmissions } from "@/components/recent-submissions";
import { requireSession } from "@/lib/auth";
import { getRoleLabel } from "@/lib/roles";
import { listRecentSubmissionsForSession } from "@/lib/submissions";

const cards = [
  {
    href: "/admissao",
    eyebrow: "Fluxo 01",
    title: "Admissao",
    description:
      "Cadastre novos colaboradores com secoes dedicadas para dados pessoais, documentos, contrato, jornada e dependentes.",
  },
  {
    href: "/movimentacoes",
    eyebrow: "Fluxo 02",
    title: "Rescisao, Ferias e Alteracoes",
    description:
      "Registre alteracoes cadastrais e contratuais, programe ferias e acompanhe eventos de rescisao em um unico fluxo.",
  },
];

export default async function DashboardPage() {
  const session = await requireSession();
  const submissions = await listRecentSubmissionsForSession(session);

  return (
    <main className="container-page py-10">
      <section className="card overflow-hidden">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%),linear-gradient(135deg,_#142d55,_#0d1f3c)] px-8 py-14 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
              RH Flow
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
              Ola, {session.name}. O ambiente esta pronto para operar os fluxos da FIF.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Acesse os formularios principais, acompanhe os registros recentes permitidos ao seu perfil e mantenha o historico vinculado ao usuario logado.
            </p>
          </div>

          <div className="grid gap-3 self-end">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Usuario autenticado</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{session.email}</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">Perfil atual</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{getRoleLabel(session.role)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="card group p-8 transition hover:-translate-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              {card.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">{card.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{card.description}</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              Abrir formulario
              <span className="transition group-hover:translate-x-1">-&gt;</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-10">
        <RecentSubmissions currentRole={session.role} submissions={submissions} />
      </div>
    </main>
  );
}
