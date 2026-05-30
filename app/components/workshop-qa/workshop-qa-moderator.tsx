"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { QA_ROOMS, qaRoomLabel } from "@/app/lib/workshop-qa/rooms";
import type { QaQuestion, QaQuestionStatus, QaRoomId } from "@/app/lib/workshop-qa/types";

const MOD_STORAGE = "workshop-qa-mod";

export function WorkshopQaModerator({ year }: { year: string }) {
  const [modPassword, setModPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [room, setRoom] = useState<QaRoomId>("debate-painel-1");
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const pwd = sessionStorage.getItem(MOD_STORAGE);
    if (!pwd) return;
    try {
      const res = await fetch(`/api/workshop/${year}/qa?room=${room}`, {
        headers: { "x-workshop-qa-mod": pwd },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(MOD_STORAGE);
        setUnlocked(false);
        return;
      }
      const data = (await res.json()) as { questions?: QaQuestion[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao carregar.");
        return;
      }
      setQuestions(
        (data.questions ?? []).sort((a, b) => a.createdAt - b.createdAt),
      );
      setError("");
    } catch {
      setError("Erro de ligação.");
    }
  }, [room, year]);

  useEffect(() => {
    const saved = sessionStorage.getItem(MOD_STORAGE);
    if (saved) {
      setModPassword(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    load();
    const id = window.setInterval(load, 4000);
    return () => window.clearInterval(id);
  }, [unlocked, load]);

  const unlock = () => {
    if (!modPassword.trim()) return;
    sessionStorage.setItem(MOD_STORAGE, modPassword.trim());
    setUnlocked(true);
  };

  const setStatus = async (id: string, status: QaQuestionStatus) => {
    const pwd = sessionStorage.getItem(MOD_STORAGE);
    if (!pwd) return;
    await fetch(`/api/workshop/${year}/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modPassword: pwd, room, status }),
    });
    load();
  };

  const visible = questions.filter((q) => q.status !== "hidden");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="section-label mb-2">Acesso restrito</p>
      <h1 className="font-display mb-6 text-2xl font-semibold tracking-wide uppercase">
        Moderar perguntas
      </h1>

      {!unlocked ? (
        <div className="card-tactical max-w-md space-y-4 p-6">
          <input
            type="password"
            value={modPassword}
            onChange={(e) => setModPassword(e.target.value)}
            placeholder="Password de moderação"
            autoComplete="off"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
          />
          <button type="button" onClick={unlock} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            {QA_ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoom(r.id)}
                className={
                  room === r.id
                    ? "btn-primary px-4 py-2 text-xs"
                    : "btn-outline px-4 py-2 text-xs"
                }
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={load}
              className="btn-outline px-4 py-2 text-xs"
            >
              Atualizar
            </button>
          </div>

          {error && <p className="mb-4 text-sm text-muted">{error}</p>}

          <p className="mb-4 font-mono text-xs text-muted">
            {visible.length} pergunta(s) · atualização automática
          </p>

          <ul className="space-y-4">
            {visible.map((q) => (
              <li key={q.id} className="card-tactical p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xs tracking-wider text-gold uppercase">
                    {q.author}
                  </span>
                  <span className="font-mono text-[0.6rem] text-muted uppercase">
                    {q.status}
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-foreground">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["approved", "Aprovar"],
                      ["answered", "Respondida"],
                      ["hidden", "Ocultar"],
                      ["pending", "Pendente"],
                    ] as const
                  ).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(q.id, status)}
                      className={
                        q.status === status
                          ? "border border-gold bg-gold/15 px-3 py-1 font-mono text-[0.6rem] text-gold uppercase"
                          : "border border-gold/25 px-3 py-1 font-mono text-[0.6rem] text-muted uppercase hover:border-gold/45"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          {visible.length === 0 && (
            <p className="text-sm text-muted">Ainda sem perguntas neste debate.</p>
          )}

          <Link
            href={`/eventos/workshop/${year}/perguntas?sala=${room}`}
            className="mt-10 inline-block font-mono text-xs text-muted hover:text-gold"
          >
            Link do público →
          </Link>
        </>
      )}
    </div>
  );
}
