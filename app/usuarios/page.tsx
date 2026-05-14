import { CreateUserForm } from "@/components/create-user-form";
import { requireAdminSession } from "@/lib/auth";
import { listUsers } from "@/lib/users";

export default async function UsersPage() {
  await requireAdminSession();
  const users = await listUsers();

  return (
    <main className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <CreateUserForm />

        <section className="card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Usuários</p>
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
                    <td className="py-4 pr-4 capitalize">{user.role}</td>
                    <td className="py-4 capitalize">{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
