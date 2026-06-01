"use client";

import { useCallback, useEffect, useState } from "react";
import type { Member } from "@/app/lib/members/types";

export function AdminAdesoesPanel() {
  const [pending, setPending] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [gescoAccessById, setGescoAccessById] = useState<Record<string, boolean>>({});

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
    await fetch(`/api/admin/members/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gescoAccess: gescoAccessById[id] === true }),
    });
    setGescoAccessById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
        recusar. Ao autorizar, pode marcar o acesso ao GesCO; o membro recebe email com
        link para definir a password.
      </p>
      {error && <p className="mb-4 text-sm text-muted">{error}</p>}
      <ul className="space-y-4">
        {pending.map((m) => (
          <li key={m.id} className="card-tactical flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold uppercase">{m.name}</p>
              <p className="text-sm text-muted">{m.email}</p>
              <p className="mt-1 font-mono text-[0.65rem] text-muted">
                {new Date(m.created_at).toLocaleString("pt-PT")}
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 border border-gold/15 bg-background/40 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                  checked={gescoAccessById[m.id] === true}
                  onChange={(e) =>
                    setGescoAccessById((prev) => ({
                      ...prev,
                      [m.id]: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm leading-relaxed text-muted">
                  <strong className="text-foreground">Autorizar acesso ao GesCO</strong> — o
                  membro verá a ligação à plataforma de Gestão de Competências Operacionais no
                  menu e na secção GesCO.
                </span>
              </label>
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col sm:pt-1">
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
