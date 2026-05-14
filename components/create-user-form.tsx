"use client";

import { useState } from "react";

export function CreateUserForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Guardamos a referência antes do await para evitar acesso ao evento depois.
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Não foi possível criar o usuário.");
      return;
    }

    setMessage("Usuário criado com sucesso.");
    formElement.reset();
  }

  return (
    <form className="card p-6" onSubmit={onSubmit}>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Administração</p>
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
          <select name="role" defaultValue="user">
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <button
        className="mt-6 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
        disabled={loading}
        type="submit"
      >
        {loading ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
