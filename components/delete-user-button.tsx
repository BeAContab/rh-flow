"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getRoleLabel, type AppRole } from "@/lib/roles";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: AppRole;
};

export function DeleteUserButton({ userId, userName, userEmail, userRole }: DeleteUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Atencao: voce esta prestes a excluir o usuario ${userName} (${userEmail}) com perfil ${getRoleLabel(userRole)}. Deseja continuar?`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel excluir o usuario.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={handleDelete}
        type="button"
      >
        {loading ? "Excluindo..." : "Excluir"}
      </button>

      {error ? <p className="max-w-48 text-right text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
