"use client";

import { useCallback, useEffect, useState } from "react";
import type { Member } from "@/app/lib/members/types";

export function AdminAdesoesPanel() {
  const [pending, setPending] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/members");
    if (res.status === 401) {
      window.location.href = "/entrar";
      return;
    }
    const data = (await res.json()) as { pending?: Member[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Erro ao carregar.");
      return;
    }
    setPending(data.pending ?? []);
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/members/${id}/approve`, { method: "POST" });
    await load();
    setBusyId(null);
  };

  const reject = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/members/${id}/reject`, { method: "POST" });
    await load();
    setBusyId(null);
  };

  return (
    <div>
      <p className="mb-6 text-sm text-muted">
        Novos pedidos disparam email para{" "}
        <code className="text-gold">ocarrista.cc@gmail.com</code> (
        <code className="text-gold">ADMIN_NOTIFY_EMAIL</code> na Vercel). Aqui pode autorizar ou
        recusar; ao autorizar, o membro recebe email
        com link para definir a password.
      </p>
      {error && <p className="mb-4 text-sm text-muted">{error}</p>}
      <ul className="space-y-4">
        {pending.map((m) => (
          <li key={m.id} className="card-tactical flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-sm font-semibold uppercase">{m.name}</p>
              <p className="text-sm text-muted">{m.email}</p>
              <p className="mt-1 font-mono text-[0.65rem] text-muted">
                {new Date(m.created_at).toLocaleString("pt-PT")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => approve(m.id)}
                className="btn-primary px-4 py-2 text-xs"
              >
                Autorizar
              </button>
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => reject(m.id)}
                className="btn-outline px-4 py-2 text-xs"
              >
                Recusar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {pending.length === 0 && (
        <p className="text-sm text-muted">Sem pedidos pendentes.</p>
      )}
    </div>
  );
}
