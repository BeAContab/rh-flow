import { CreateUserForm } from "@/components/create-user-form";
import { DeleteUserButton } from "@/components/delete-user-button";
import { requireUserManagementSession } from "@/lib/auth";
import { canDeleteRole, getCreatableRoles, getRoleLabel } from "@/lib/roles";
import { listUserAuditLogs } from "@/lib/user-audit-logs";
import { listUsers } from "@/lib/users";

export default async function UsersPage() {
  const session = await requireUserManagementSession();
  const users = await listUsers();
  const auditLogs = await listUserAuditLogs();
  const creatableRoles = getCreatableRoles(session.role);

  return (
    <main className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <CreateUserForm allowedRoles={creatableRoles} currentRole={session.role} />

        <section className="card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Usuarios</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Acessos cadastrados</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            SUPER USER pode excluir apenas usuarios USER. ADMIN pode excluir usuarios SUPER USER e USER, mas nunca outro ADMIN.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Nome</th>
                  <th className="py-3 pr-4 font-medium">E-mail</th>
                  <th className="py-3 pr-4 font-medium">Perfil</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Acao</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userRole = user.role as typeof session.role;
                  const canDelete = session.userId !== user.id && canDeleteRole(session.role, userRole);

                  return (
                    <tr key={user.id} className="border-b border-slate-100 text-slate-700">
                      <td className="py-4 pr-4">{user.name}</td>
                      <td className="py-4 pr-4">{user.email}</td>
                      <td className="py-4 pr-4">{getRoleLabel(userRole)}</td>
                      <td className="py-4 pr-4 capitalize">{user.status}</td>
                      <td className="py-4 text-right">
                        {canDelete ? (
                          <DeleteUserButton
                            userEmail={user.email}
                            userId={user.id}
                            userName={user.name}
                            userRole={userRole}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">Sem permissao</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card mt-6 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Auditoria</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Log de inclusoes e exclusoes</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Este historico registra quem executou a acao, sobre qual usuario e em qual momento.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Data</th>
                <th className="py-3 pr-4 font-medium">Acao</th>
                <th className="py-3 pr-4 font-medium">Executado por</th>
                <th className="py-3 pr-4 font-medium">Perfil</th>
                <th className="py-3 pr-4 font-medium">Usuario afetado</th>
                <th className="py-3 font-medium">Perfil afetado</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-4 pr-4">
                      {new Date(log.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-4 pr-4">{log.action === "user_created" ? "Inclusao" : "Exclusao"}</td>
                    <td className="py-4 pr-4">
                      <div className="font-medium text-slate-800">{log.actorName}</div>
                      <div className="text-xs text-slate-500">{log.actorEmail}</div>
                    </td>
                    <td className="py-4 pr-4">{getRoleLabel(log.actorRole as typeof session.role)}</td>
                    <td className="py-4 pr-4">
                      <div className="font-medium text-slate-800">{log.targetName}</div>
                      <div className="text-xs text-slate-500">{log.targetEmail}</div>
                    </td>
                    <td className="py-4">{getRoleLabel(log.targetRole as typeof session.role)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6 text-sm text-slate-500" colSpan={6}>
                    Nenhum registro de auditoria encontrado ate o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
