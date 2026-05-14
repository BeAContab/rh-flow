"use client";

import { useState } from "react";

import type { AppRole } from "@/lib/roles";
import { getRoleLabel } from "@/lib/roles";

type CreateUserFormProps = {
  allowedRoles: AppRole[];
  currentRole: AppRole;
};

export function CreateUserForm({ allowedRoles, currentRole }: CreateUserFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>(allowedRoles[0] || "user");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const role = String(formData.get("role") || "user") as AppRole;

    if (currentRole === "admin" && role === "admin") {
      const confirmed = window.confirm(
        "Atencao: voce esta prestes a criar outro ADMIN. Deseja continuar?",
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel criar o usuario.");
      return;
    }

    setMessage("Usuario criado com sucesso.");
    formElement.reset();
    setSelectedRole(allowedRoles[0] || "user");
  }

  return (
    <form className="card p-6" onSubmit={onSubmit}>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Administracao</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Criar novo acesso</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
          <input name="name" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
          <input name="email" type="email" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
          <input name="password" type="password" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Perfil</label>
          <select
            name="role"
            onChange={(event) => setSelectedRole(event.target.value as AppRole)}
            value={selectedRole}
          >
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentRole === "admin" && selectedRole === "admin" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Atencao: criar um ADMIN concede acesso total aos relatorios e ao gerenciamento dos dados.
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <button
        className="mt-6 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
        disabled={loading}
        type="submit"
      >
        {loading ? "Criando..." : "Criar usuario"}
      </button>
    </form>
  );
}
