"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChallengerCrew,
  ChallengerImportMeta,
  ChallengerPhase,
  ChallengerProva,
  ChallengerScore,
  ChallengerScoreKind,
  ChallengerSettings,
  ChallengerStanding,
} from "@/app/lib/challenger/types";
import { CHALLENGER_SKETCH_ACCEPT, sketchLabel } from "@/app/lib/challenger/sketch";
import { StandingsTable } from "../events/challenger/challenger-classification";

type Tab = "provas" | "crews" | "scores" | "import" | "publish";

type AdminPayload = {
  configured: boolean;
  settings: ChallengerSettings | null;
  provas: ChallengerProva[];
  crews: ChallengerCrew[];
  scores: ChallengerScore[];
  provisional: ChallengerStanding[];
  final: ChallengerStanding[];
  draftProvisional?: ChallengerStanding[];
  draftFinal?: ChallengerStanding[];
  importMeta?: ChallengerImportMeta;
  error?: string;
};

const emptyMembers = () =>
  [1, 2, 3, 4].map((position) => ({ position, name: "", role: "" }));

export function AdminChallengerView({ year }: { year: string }) {
  const [tab, setTab] = useState<Tab>("provas");
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const [provaDraft, setProvaDraft] = useState({ title: "", description: "" });
  const [provaFile, setProvaFile] = useState<File | null>(null);

  const [editingProvaId, setEditingProvaId] = useState<string | null>(null);
  const [editProvaDraft, setEditProvaDraft] = useState({ title: "", description: "" });
  const [editProvaFile, setEditProvaFile] = useState<File | null>(null);
  const [clearEditSketch, setClearEditSketch] = useState(false);

  const [crewDraft, setCrewDraft] = useState({
    name: "",
    members: emptyMembers(),
  });

  const [scoreDraft, setScoreDraft] = useState({
    crew_id: "",
    prova_id: "",
    points: "",
    kind: "prova" as ChallengerScoreKind,
    phase: "provisional" as ChallengerPhase,
    label: "",
    notes: "",
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/challenger/${year}`);
    if (res.status === 401) {
      window.location.href = "/entrar";
      return;
    }
    const json = (await res.json()) as AdminPayload;
    if (!res.ok) {
      setError(json.error ?? "Erro ao carregar dados.");
      return;
    }
    setData(json);
    setError(
      json.configured
        ? ""
        : "Base de dados em falta ou tabelas do Challenger não criadas. Execute scripts/migrate-challenger.sql e scripts/migrate-challenger-import.sql no Neon.",
    );
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCrews = useMemo(
    () => data?.crews.filter((c) => c.active) ?? [],
    [data?.crews],
  );

  const addProva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provaDraft.title.trim()) return;
    setBusy(true);
    setFeedback("");
    const form = new FormData();
    form.set("title", provaDraft.title);
    form.set("description", provaDraft.description);
    if (provaFile) form.set("sketch", provaFile);

    const res = await fetch(`/api/admin/challenger/${year}/provas`, {
      method: "POST",
      body: form,
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(json.error ?? "Erro ao criar prova.");
    else {
      setFeedback("Prova criada.");
      setProvaDraft({ title: "", description: "" });
      setProvaFile(null);
    }
    await load();
    setBusy(false);
  };

  const removeProva = async (id: string) => {
    if (!confirm("Eliminar esta prova?")) return;
    setBusy(true);
    await fetch(`/api/admin/challenger/${year}/provas?id=${id}`, { method: "DELETE" });
    if (editingProvaId === id) setEditingProvaId(null);
    await load();
    setBusy(false);
  };

  const startEditProva = (prova: ChallengerProva) => {
    setEditingProvaId(prova.id);
    setEditProvaDraft({
      title: prova.title,
      description: prova.description ?? "",
    });
    setEditProvaFile(null);
    setClearEditSketch(false);
    setFeedback("");
  };

  const cancelEditProva = () => {
    setEditingProvaId(null);
    setEditProvaFile(null);
    setClearEditSketch(false);
  };

  const saveProvaEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvaId || !editProvaDraft.title.trim()) return;
    setBusy(true);
    setFeedback("");

    const form = new FormData();
    form.set("id", editingProvaId);
    form.set("title", editProvaDraft.title);
    form.set("description", editProvaDraft.description);
    if (clearEditSketch) form.set("clear_sketch", "1");
    if (editProvaFile) form.set("sketch", editProvaFile);

    const res = await fetch(`/api/admin/challenger/${year}/provas`, {
      method: "PATCH",
      body: form,
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(json.error ?? "Erro ao guardar prova.");
    else {
      setFeedback("Prova actualizada.");
      cancelEditProva();
    }
    await load();
    setBusy(false);
  };

  const addCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    const res = await fetch(`/api/admin/challenger/${year}/crews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crewDraft),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(json.error ?? "Erro ao inscrever guarnição.");
    else {
      setFeedback("Guarnição inscrita.");
      setCrewDraft({ name: "", members: emptyMembers() });
    }
    await load();
    setBusy(false);
  };

  const toggleCrewActive = async (crew: ChallengerCrew) => {
    setBusy(true);
    await fetch(`/api/admin/challenger/${year}/crews`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: crew.id, active: !crew.active }),
    });
    await load();
    setBusy(false);
  };

  const removeCrew = async (id: string) => {
    if (!confirm("Eliminar esta guarnição?")) return;
    setBusy(true);
    await fetch(`/api/admin/challenger/${year}/crews?id=${id}`, { method: "DELETE" });
    await load();
    setBusy(false);
  };

  const addScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    const res = await fetch(`/api/admin/challenger/${year}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crew_id: scoreDraft.crew_id,
        prova_id: scoreDraft.kind === "prova" ? scoreDraft.prova_id || null : null,
        points: Number(scoreDraft.points),
        kind: scoreDraft.kind,
        phase: scoreDraft.phase,
        label: scoreDraft.label,
        notes: scoreDraft.notes || null,
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) setFeedback(json.error ?? "Erro ao registar pontuação.");
    else {
      setFeedback("Pontuação registada.");
      setScoreDraft((s) => ({ ...s, points: "", label: "", notes: "" }));
    }
    await load();
    setBusy(false);
  };

  const removeScore = async (id: string) => {
    setBusy(true);
    await fetch(`/api/admin/challenger/${year}/scores?id=${id}`, { method: "DELETE" });
    await load();
    setBusy(false);
  };

  const updatePublish = async (fields: {
    provisional_visible?: boolean;
    final_visible?: boolean;
  }) => {
    setBusy(true);
    const res = await fetch(`/api/admin/challenger/${year}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const json = (await res.json()) as { error?: string };
    setFeedback(res.ok ? "Publicação actualizada." : (json.error ?? "Erro."));
    await load();
    setBusy(false);
  };

  const uploadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setBusy(true);
    setFeedback("");
    setImportWarnings([]);

    const form = new FormData();
    form.set("file", importFile);

    const res = await fetch(`/api/admin/challenger/${year}/import`, {
      method: "POST",
      body: form,
    });
    const json = (await res.json()) as {
      error?: string;
      errors?: string[];
      warnings?: string[];
      teams?: number;
    };

    if (!res.ok) {
      setFeedback(json.errors?.[0] ?? json.error ?? "Erro ao importar.");
      setImportWarnings(json.warnings ?? []);
    } else {
      setFeedback(
        `Excel importado para rascunho (${json.teams ?? 0} equipas). Revise e publique quando estiver correcto.`,
      );
      setImportWarnings(json.warnings ?? []);
      setImportFile(null);
    }
    await load();
    setBusy(false);
  };

  const publishPhase = async (phase: ChallengerPhase) => {
    const label = phase === "provisional" ? "provisória" : "final";
    const draft =
      phase === "provisional" ? data?.draftProvisional : data?.draftFinal;
    if (!draft?.length) {
      setFeedback(`Não há rascunho ${label} para publicar.`);
      return;
    }
    if (
      !confirm(
        `Publicar classificação ${label} no site?\n\n${draft.length} equipas no rascunho.\nOs visitantes verão estes dados.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setFeedback("");
    const res = await fetch(`/api/admin/challenger/${year}/import/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase, makeVisible: true }),
    });
    const json = (await res.json()) as { error?: string };
    setFeedback(
      res.ok
        ? `Classificação ${label} publicada e visível no site.`
        : (json.error ?? "Erro ao publicar."),
    );
    await load();
    setBusy(false);
  };

  const draftChangeMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const published = data?.provisional ?? [];
    const draft = data?.draftProvisional ?? [];
    for (const row of draft) {
      const prev = published.find((p) => p.crewId === row.crewId);
      if (!prev) {
        map.set(row.crewId, ["nova"]);
        continue;
      }
      const changes: string[] = [];
      if (prev.rank !== row.rank) changes.push("posição");
      if (prev.finalTime !== row.finalTime) changes.push("tempo");
      if (prev.total !== row.total) changes.push("pontos");
      if (changes.length) map.set(row.crewId, changes);
    }
    return map;
  }, [data?.draftProvisional, data?.provisional]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "provas", label: "Provas" },
    { id: "crews", label: "Guarnições" },
    { id: "scores", label: "Pontuação manual" },
    { id: "import", label: "Importar Excel" },
    { id: "publish", label: "Publicação" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-display text-xs tracking-[0.12em] uppercase ${
              tab === t.id
                ? "bg-gold text-background"
                : "border border-gold/30 text-gold hover:bg-gold/10"
            }`}
          >
            {t.label}
          </button>
        ))}
        <a
          href={`/eventos/challenger/${year}`}
          className="ml-auto font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-gold-bright"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver página pública →
        </a>
      </div>

      {error && (
        <p className="mb-6 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          {error}
        </p>
      )}
      {feedback && (
        <p className="mb-6 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {feedback}
        </p>
      )}

      {tab === "provas" && (
        <div className="space-y-10">
          <form onSubmit={addProva} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nova prova
            </h3>
            <input
              value={provaDraft.title}
              onChange={(e) => setProvaDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Nome da prova"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={provaDraft.description}
              onChange={(e) =>
                setProvaDraft((d) => ({ ...d, description: e.target.value }))
              }
              placeholder="Descrição (opcional)"
              rows={3}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <div>
              <label className="mb-2 block text-xs text-muted">
                Croqui / briefing (PDF, PPT ou imagem)
              </label>
              <input
                type="file"
                accept={CHALLENGER_SKETCH_ACCEPT}
                onChange={(e) => setProvaFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Adicionar prova
            </button>
          </form>

          <div className="space-y-4">
            {(data?.provas ?? []).map((prova) =>
              editingProvaId === prova.id ? (
                <form
                  key={prova.id}
                  onSubmit={saveProvaEdit}
                  className="card-tactical space-y-4 border border-gold/40 p-6"
                >
                  <h4 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
                    Editar prova
                  </h4>
                  <input
                    value={editProvaDraft.title}
                    onChange={(e) =>
                      setEditProvaDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="Nome da prova"
                    className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
                    required
                  />
                  <textarea
                    value={editProvaDraft.description}
                    onChange={(e) =>
                      setEditProvaDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    placeholder="Descrição (opcional)"
                    rows={3}
                    className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
                  />
                  {prova.sketch_url && !clearEditSketch && (
                    <p className="text-xs text-muted">
                      Ficheiro actual:{" "}
                      <a
                        href={prova.sketch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        {sketchLabel(prova.sketch_mime, prova.sketch_label, prova.sketch_url)}
                      </a>
                    </p>
                  )}
                  <div>
                    <label className="mb-2 block text-xs text-muted">
                      Substituir croqui (PDF, PPT ou imagem)
                    </label>
                    <input
                      type="file"
                      accept={CHALLENGER_SKETCH_ACCEPT}
                      onChange={(e) => {
                        setEditProvaFile(e.target.files?.[0] ?? null);
                        if (e.target.files?.[0]) setClearEditSketch(false);
                      }}
                      className="text-sm text-muted"
                    />
                  </div>
                  {prova.sketch_url && (
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={clearEditSketch}
                        onChange={(e) => {
                          setClearEditSketch(e.target.checked);
                          if (e.target.checked) setEditProvaFile(null);
                        }}
                      />
                      Remover ficheiro actual
                    </label>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
                      Guardar alterações
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditProva}
                      className="btn-outline px-4 py-2 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div key={prova.id} className="card-tactical p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="font-display text-lg text-foreground">{prova.title}</h4>
                      {prova.description && (
                        <p className="mt-2 text-sm text-muted">{prova.description}</p>
                      )}
                      {prova.sketch_url ? (
                        <a
                          href={prova.sketch_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-xs text-gold"
                        >
                          {sketchLabel(prova.sketch_mime, prova.sketch_label, prova.sketch_url)} →
                        </a>
                      ) : (
                        <p className="mt-3 text-xs text-muted">Sem croqui</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => startEditProva(prova)}
                        className="btn-outline px-3 py-1.5 text-[0.65rem]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProva(prova.id)}
                        className="text-xs text-red-400/90 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {tab === "crews" && (
        <div className="space-y-10">
          <form onSubmit={addCrew} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Inscrever guarnição ({activeCrews.length} activas)
            </h3>
            <input
              value={crewDraft.name}
              onChange={(e) => setCrewDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Nome da guarnição"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {crewDraft.members.map((m, i) => (
                <div key={m.position} className="space-y-2">
                  <input
                    value={m.name}
                    onChange={(e) => {
                      const members = [...crewDraft.members];
                      members[i] = { ...members[i], name: e.target.value };
                      setCrewDraft((d) => ({ ...d, members }));
                    }}
                    placeholder={`Elemento ${m.position} — nome`}
                    className="w-full border border-gold/20 bg-background/80 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    value={m.role}
                    onChange={(e) => {
                      const members = [...crewDraft.members];
                      members[i] = { ...members[i], role: e.target.value };
                      setCrewDraft((d) => ({ ...d, members }));
                    }}
                    placeholder="Função (opcional)"
                    className="w-full border border-gold/20 bg-background/80 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Inscrever guarnição
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            {(data?.crews ?? []).map((crew) => (
              <div
                key={crew.id}
                className={`card-tactical p-6 ${!crew.active ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-display text-lg text-gold">{crew.name}</h4>
                  <span className="font-mono text-[0.6rem] text-muted">
                    {crew.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <ul className="mt-4 space-y-1 text-sm">
                  {crew.members.map((m) => (
                    <li key={m.id}>
                      {m.name}
                      {m.role ? ` · ${m.role}` : ""}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCrewActive(crew)}
                    className="btn-outline px-3 py-1.5 text-[0.65rem]"
                  >
                    {crew.active ? "Desactivar" : "Reactivar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCrew(crew.id)}
                    className="text-[0.65rem] text-red-400/90"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "scores" && (
        <div className="space-y-10">
          <form onSubmit={addScore} className="card-tactical grid gap-4 p-6 sm:grid-cols-2">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase sm:col-span-2">
              Registar pontuação ou penalização
            </h3>
            <select
              value={scoreDraft.crew_id}
              onChange={(e) => setScoreDraft((s) => ({ ...s, crew_id: e.target.value }))}
              className="border border-gold/20 bg-background/80 px-3 py-2 text-sm"
              required
            >
              <option value="">Guarnição</option>
              {activeCrews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={scoreDraft.kind}
              onChange={(e) =>
                setScoreDraft((s) => ({
                  ...s,
                  kind: e.target.value as ChallengerScoreKind,
                }))
              }
              className="border border-gold/20 bg-background/80 px-3 py-2 text-sm"
            >
              <option value="prova">Pontos de prova</option>
              <option value="penalty">Penalização</option>
              <option value="bonus">Bónus</option>
            </select>
            {scoreDraft.kind === "prova" && (
              <select
                value={scoreDraft.prova_id}
                onChange={(e) => setScoreDraft((s) => ({ ...s, prova_id: e.target.value }))}
                className="border border-gold/20 bg-background/80 px-3 py-2 text-sm sm:col-span-2"
                required
              >
                <option value="">Prova</option>
                {(data?.provas ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
            <input
              type="number"
              step="0.01"
              value={scoreDraft.points}
              onChange={(e) => setScoreDraft((s) => ({ ...s, points: e.target.value }))}
              placeholder="Pontos (negativo para penalização)"
              className="border border-gold/20 bg-background/80 px-3 py-2 text-sm"
              required
            />
            <select
              value={scoreDraft.phase}
              onChange={(e) =>
                setScoreDraft((s) => ({
                  ...s,
                  phase: e.target.value as ChallengerPhase,
                }))
              }
              className="border border-gold/20 bg-background/80 px-3 py-2 text-sm"
            >
              <option value="provisional">Provisória</option>
              <option value="final">Final</option>
            </select>
            <input
              value={scoreDraft.label}
              onChange={(e) => setScoreDraft((s) => ({ ...s, label: e.target.value }))}
              placeholder="Nota / motivo (opcional)"
              className="border border-gold/20 bg-background/80 px-3 py-2 text-sm sm:col-span-2"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary px-4 py-2 text-xs sm:col-span-2"
            >
              Registar
            </button>
          </form>

          <div className="space-y-2">
            {(data?.scores ?? []).map((score) => {
              const crew = data?.crews.find((c) => c.id === score.crew_id);
              const prova = data?.provas.find((p) => p.id === score.prova_id);
              return (
                <div
                  key={score.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-gold/15 px-4 py-3 text-sm"
                >
                  <span>
                    <strong>{crew?.name ?? "?"}</strong> · {score.kind} · {score.phase}
                    {prova ? ` · ${prova.title}` : ""} ·{" "}
                    <span className="font-mono text-gold">{score.points}</span>
                    {score.label ? ` — ${score.label}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeScore(score.id)}
                    className="text-xs text-red-400/90"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "import" && (
        <div className="space-y-10">
          <form onSubmit={uploadExcel} className="card-tactical max-w-2xl space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Importar classificação (Folha2)
            </h3>
            <p className="text-sm text-muted">
              Carregue o Excel à medida que as provas decorrem. Os dados ficam em{" "}
              <strong className="text-foreground">rascunho</strong> até confirmar a publicação.
              Células vazias mantêm os valores do rascunho anterior.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="text-sm text-muted"
              required
            />
            {data?.importMeta?.importedAt && (
              <p className="text-xs text-muted">
                Último import: {data.importMeta.filename ?? "—"} ·{" "}
                {new Date(data.importMeta.importedAt).toLocaleString("pt-PT")}
              </p>
            )}
            <button type="submit" disabled={busy || !importFile} className="btn-primary px-4 py-2 text-xs">
              Importar para rascunho
            </button>
          </form>

          {importWarnings.length > 0 && (
            <div className="border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
              <p className="mb-2 font-medium">Avisos do import:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                {importWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              disabled={busy || !(data?.draftProvisional?.length)}
              onClick={() => publishPhase("provisional")}
              className="btn-primary px-4 py-2 text-xs"
            >
              Publicar classificação provisória
            </button>
            <button
              type="button"
              disabled={busy || !(data?.draftFinal?.length)}
              onClick={() => publishPhase("final")}
              className="btn-outline px-4 py-2 text-xs"
            >
              Publicar classificação final
            </button>
          </div>

          {(data?.draftProvisional?.length ?? 0) > 0 && (
            <StandingsTable
              title="Pré-visualização — rascunho provisório"
              standings={data?.draftProvisional ?? []}
              provas={data?.provas ?? []}
              highlightChanges={draftChangeMap}
            />
          )}

          {(data?.draftFinal?.length ?? 0) > 0 && (
            <StandingsTable
              title="Pré-visualização — rascunho final"
              standings={data?.draftFinal ?? []}
              provas={data?.provas ?? []}
            />
          )}

          {(data?.provisional?.length ?? 0) > 0 && (
            <StandingsTable
              title="Publicado no site — provisória"
              standings={data?.provisional ?? []}
              provas={data?.provas ?? []}
            />
          )}
        </div>
      )}

      {tab === "publish" && (
        <div className="card-tactical max-w-lg space-y-6 p-6">
          <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
            Visibilidade das classificações
          </h3>
          <p className="text-sm text-muted">
            Os dados só chegam ao site após importar o Excel e clicar em «Publicar» na tab
            Importar Excel. Use estes interruptores para ocultar temporariamente sem apagar dados.
          </p>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={data?.settings?.provisional_visible ?? true}
              onChange={(e) => updatePublish({ provisional_visible: e.target.checked })}
              disabled={busy}
            />
            Mostrar classificação provisória no site
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={data?.settings?.final_visible ?? false}
              onChange={(e) => updatePublish({ final_visible: e.target.checked })}
              disabled={busy}
            />
            Mostrar classificação final no site
          </label>
          <p className="text-xs text-muted">
            Execute <code className="text-gold">scripts/migrate-challenger.sql</code> e{" "}
            <code className="text-gold">scripts/migrate-challenger-import.sql</code> no Neon
            antes da primeira utilização. Para upload de croquis, ligue um store{" "}
            <strong>Blob público</strong> na Vercel — basta{" "}
            <code className="text-gold">BLOB_STORE_ID</code> (OIDC; não precisa de token manual).
          </p>
        </div>
      )}
    </div>
  );
}
