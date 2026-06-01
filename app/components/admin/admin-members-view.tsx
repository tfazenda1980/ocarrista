"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MemberPublic } from "@/app/lib/members/public";
import type { MemberStatus } from "@/app/lib/members/types";

type Filter = "all" | MemberStatus;

const statusLabel: Record<MemberStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
};

type AdminMembersViewProps = {
  initialFilter?: string;
};

export function AdminMembersView({ initialFilter }: AdminMembersViewProps) {
  const [members, setMembers] = useState<MemberPublic[]>([]);
  const [filter, setFilter] = useState<Filter>(() => {
    if (initialFilter === "pending" || initialFilter === "approved" || initialFilter === "rejected") {
      return initialFilter;
    }
    return "all";
  });
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gescoById, setGescoById] = useState<Record<string, boolean>>({});
  const [editDraft, setEditDraft] = useState<{ name: string; email: string } | null>(null);
  const [messageDraft, setMessageDraft] = useState<{ subject: string; message: string }>({
    subject: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/members");
    if (res.status === 401) {
      window.location.href = "/entrar";
      return;
    }
    const data = (await res.json()) as { members?: MemberPublic[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Erro ao carregar membros.");
      return;
    }
    setMembers(data.members ?? []);
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return members;
    return members.filter((m) => m.status === filter);
  }, [members, filter]);

  const counts = useMemo(
    () => ({
      all: members.length,
      pending: members.filter((m) => m.status === "pending").length,
      approved: members.filter((m) => m.status === "approved").length,
      rejected: members.filter((m) => m.status === "rejected").length,
    }),
    [members],
  );

  const openMember = (m: MemberPublic) => {
    setExpandedId(m.id);
    setEditDraft({ name: m.name, email: m.email });
    setMessageDraft({ subject: "", message: "" });
    setGescoById((prev) => ({ ...prev, [m.id]: m.gesco_access }));
    setFeedback("");
  };

  const approve = async (id: string) => {
    setBusyId(id);
    setFeedback("");
    const res = await fetch(`/api/admin/members/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gescoAccess: gescoById[id] === true }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(data.error ?? "Não foi possível aprovar.");
    else setFeedback("Membro aprovado — email de activação enviado (se Resend configurado).");
    setExpandedId(null);
    await load();
    setBusyId(null);
  };

  const reject = async (id: string) => {
    if (!confirm("Recusar este pedido de adesão?")) return;
    setBusyId(id);
    await fetch(`/api/admin/members/${id}/reject`, { method: "POST" });
    setExpandedId(null);
    await load();
    setBusyId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    setBusyId(id);
    setFeedback("");
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name,
        email: editDraft.email,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(data.error ?? "Erro ao guardar.");
    else setFeedback("Dados actualizados.");
    await load();
    setBusyId(null);
  };

  const saveGesco = async (id: string) => {
    setBusyId(id);
    setFeedback("");
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gescoAccess: gescoById[id] === true }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(data.error ?? "Erro ao actualizar GesCO.");
    else setFeedback("Permissão GesCO actualizada. O membro deve voltar a entrar para ver alterações no menu.");
    await load();
    setBusyId(null);
  };

  const sendMessage = async (id: string) => {
    setBusyId(id);
    setFeedback("");
    const res = await fetch(`/api/admin/members/${id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageDraft),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(data.error ?? "Email não enviado.");
    else {
      setFeedback("Mensagem enviada por email.");
      setMessageDraft({ subject: "", message: "" });
    }
    setBusyId(null);
  };

  const removeMember = async (id: string, name: string) => {
    if (!confirm(`Eliminar definitivamente o membro «${name}»? Esta acção não pode ser anulada.`)) {
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setFeedback(data.error ?? "Não foi possível eliminar.");
    } else {
      setExpandedId(null);
      await load();
    }
    setBusyId(null);
  };

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "pending", label: "Pendentes", count: counts.pending },
    { key: "approved", label: "Aprovados", count: counts.approved },
    { key: "rejected", label: "Recusados", count: counts.rejected },
  ];

  return (
    <div>
      <nav className="mb-8 flex flex-wrap gap-2 border-b border-gold/15 pb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`font-display px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${
              filter === f.key
                ? "bg-gold text-background"
                : "text-gold/75 hover:bg-gold/10 hover:text-gold"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </nav>

      {error && <p className="mb-4 text-sm text-muted">{error}</p>}
      {feedback && <p className="mb-4 text-sm text-gold">{feedback}</p>}

      <ul className="space-y-4">
        {filtered.map((m) => {
          const expanded = expandedId === m.id;
          return (
            <li key={m.id} className="card-tactical overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold uppercase">{m.name}</p>
                    <span className="font-mono text-[0.6rem] tracking-wider text-gold uppercase">
                      {statusLabel[m.status]}
                    </span>
                    {m.gesco_access && m.status === "approved" && (
                      <span className="font-mono text-[0.6rem] text-muted">· GesCO</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{m.email}</p>
                  <p className="mt-1 font-mono text-[0.65rem] text-muted">
                    Registo: {new Date(m.created_at).toLocaleString("pt-PT")}
                    {m.hasPassword ? " · password definida" : " · sem password"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-outline px-3 py-2 text-xs"
                  onClick={() => (expanded ? setExpandedId(null) : openMember(m))}
                >
                  {expanded ? "Fechar" : "Gerir"}
                </button>
              </div>

              {expanded && editDraft && (
                <div className="space-y-6 border-t border-gold/15 bg-surface/30 p-5">
                  {m.status === "pending" && (
                    <div className="space-y-4">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 accent-gold"
                          checked={gescoById[m.id] === true}
                          onChange={(e) =>
                            setGescoById((prev) => ({ ...prev, [m.id]: e.target.checked }))
                          }
                        />
                        <span className="text-sm text-muted">
                          Autorizar acesso ao <strong className="text-foreground">GesCO</strong>{" "}
                          ao aprovar
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => approve(m.id)}
                          className="btn-primary px-4 py-2 text-xs"
                        >
                          Autorizar adesão
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
                    </div>
                  )}

                  <div>
                    <h4 className="font-display mb-3 text-xs tracking-[0.12em] text-gold uppercase">
                      Editar dados
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={editDraft.name}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))
                        }
                        className="border border-gold/20 bg-background/80 px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
                        placeholder="Nome"
                      />
                      <input
                        type="email"
                        value={editDraft.email}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, email: e.target.value } : d))
                        }
                        className="border border-gold/20 bg-background/80 px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
                        placeholder="Email"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => saveEdit(m.id)}
                      className="btn-outline mt-3 px-4 py-2 text-xs"
                    >
                      Guardar dados
                    </button>
                  </div>

                  {m.status === "approved" && (
                    <>
                      <div>
                        <h4 className="font-display mb-3 text-xs tracking-[0.12em] text-gold uppercase">
                          Permissão GesCO
                        </h4>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 accent-gold"
                            checked={gescoById[m.id] === true}
                            onChange={(e) =>
                              setGescoById((prev) => ({ ...prev, [m.id]: e.target.checked }))
                            }
                          />
                          <span className="text-sm text-muted">
                            Membro pode ver a secção e ligação GesCO no site
                          </span>
                        </label>
                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => saveGesco(m.id)}
                          className="btn-outline mt-3 px-4 py-2 text-xs"
                        >
                          Actualizar GesCO
                        </button>
                      </div>

                      <div>
                        <h4 className="font-display mb-3 text-xs tracking-[0.12em] text-gold uppercase">
                          Enviar mensagem por email
                        </h4>
                        <div className="space-y-3">
                          <input
                            value={messageDraft.subject}
                            onChange={(e) =>
                              setMessageDraft((d) => ({ ...d, subject: e.target.value }))
                            }
                            className="w-full border border-gold/20 bg-background/80 px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
                            placeholder="Assunto"
                          />
                          <textarea
                            value={messageDraft.message}
                            onChange={(e) =>
                              setMessageDraft((d) => ({ ...d, message: e.target.value }))
                            }
                            rows={4}
                            className="w-full resize-y border border-gold/20 bg-background/80 px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
                            placeholder="Mensagem ao membro…"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => sendMessage(m.id)}
                          className="btn-primary mt-3 px-4 py-2 text-xs"
                        >
                          Enviar email
                        </button>
                      </div>
                    </>
                  )}

                  {m.status !== "pending" && (
                    <div className="border-t border-gold/10 pt-4">
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => removeMember(m.id, m.name)}
                        className="font-mono text-xs tracking-wider text-muted uppercase hover:text-red-400"
                      >
                        Eliminar membro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="text-sm text-muted">Nenhum membro neste filtro.</p>
      )}
    </div>
  );
}
