import { CreateUserForm } from "@/components/create-user-form";
import { requireUserManagementSession } from "@/lib/auth";
import { getCreatableRoles, getRoleLabel } from "@/lib/roles";
import { listUsers } from "@/lib/users";

export default async function UsersPage() {
  const session = await requireUserManagementSession();
  const users = session.role === "admin" ? await listUsers() : [];
  const creatableRoles = getCreatableRoles(session.role);

  return (
    <main className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <CreateUserForm allowedRoles={creatableRoles} currentRole={session.role} />

        {session.role === "admin" ? (
          <section className="card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Usuarios</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Acessos cadastrados</h2>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Nome</th>
                    <th className="py-3 pr-4 font-medium">E-mail</th>
                    <th className="py-3 pr-4 font-medium">Perfil</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 text-slate-700">
                      <td className="py-4 pr-4">{user.name}</td>
                      <td className="py-4 pr-4">{user.email}</td>
                      <td className="py-4 pr-4">{getRoleLabel(user.role as typeof session.role)}</td>
                      <td className="py-4 capitalize">{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Permissoes</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Escopo do SUPER USER</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Neste perfil, voce pode cadastrar apenas usuarios do tipo USER. A listagem completa de acessos e a gestao ampla dos dados ficam restritas ao ADMIN.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
