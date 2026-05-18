import Link from "next/link";

import { getCurrentSession } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export async function AppHeader() {
  const session = await getCurrentSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="text-3xl font-semibold tracking-tight text-slate-900">
          RH Flow
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <Link href="/dashboard">Inicio</Link>
              <Link href="/admissao">Admissao</Link>
              <Link href="/movimentacoes">Movimentacoes</Link>
              <Link href="/relatorios">Relatorios</Link>
              {session.role === "admin" || session.role === "super_user" ? <Link href="/usuarios">Usuarios</Link> : null}
              <form action="/api/auth/logout" method="post">
                <button type="submit">Sair</button>
              </form>
            </nav>
          ) : (
            <span className="hidden text-sm text-slate-500 md:inline">Acesso restrito</span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
