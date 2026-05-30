"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QA_ROOMS, isQaRoomId, qaRoomLabel } from "@/app/lib/workshop-qa/rooms";
import type { QaQuestion, QaRoomId } from "@/app/lib/workshop-qa/types";

const STORAGE_PREFIX = "workshop-qa-auth:";

function storageKey(year: string, room: QaRoomId): string {
  return `${STORAGE_PREFIX}${year}:${room}`;
}

export function WorkshopQaAudience({ year }: { year: string }) {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("sala") ?? searchParams.get("room") ?? "";
  const initialRoom = isQaRoomId(roomParam) ? roomParam : QA_ROOMS[0].id;

  const [room, setRoom] = useState<QaRoomId>(initialRoom);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [storage, setStorage] = useState<"redis" | "local" | "unavailable" | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey(year, room));
    if (saved) {
      setPassword(saved);
      setUnlocked(true);
    } else {
      setUnlocked(false);
      setQuestions([]);
    }
  }, [year, room]);

  const loadQuestions = useCallback(async () => {
    const pwd = sessionStorage.getItem(storageKey(year, room));
    if (!pwd) return;
    try {
      const res = await fetch(`/api/workshop/${year}/qa?room=${room}`, {
        headers: { "x-workshop-qa": pwd },
      });
      const data = (await res.json()) as {
        questions?: QaQuestion[];
        error?: string;
        storage?: "redis" | "local" | "unavailable";
      };
      if (res.status === 401) {
        sessionStorage.removeItem(storageKey(year, room));
        setUnlocked(false);
        return;
      }
      if (!res.ok) {
        setLoadError(data.error ?? "Erro ao carregar perguntas.");
        return;
      }
      setStorage(data.storage ?? null);
      setQuestions(data.questions ?? []);
      setLoadError("");
    } catch {
      setLoadError("Erro de ligação ao atualizar a lista.");
    }
  }, [room, year]);

  useEffect(() => {
    if (!unlocked) return;
    loadQuestions();
    const id = window.setInterval(loadQuestions, 4000);
    return () => window.clearInterval(id);
  }, [unlocked, loadQuestions]);

  const unlock = useCallback(() => {
    if (!password.trim()) return;
    sessionStorage.setItem(storageKey(year, room), password.trim());
    setUnlocked(true);
    setMessage("");
  }, [password, room, year]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`/api/workshop/${year}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: sessionStorage.getItem(storageKey(year, room)),
          room,
          text,
          author: author.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem(storageKey(year, room));
          setUnlocked(false);
        }
        setSubmitStatus("error");
        setMessage(data.error ?? "Não foi possível enviar.");
        return;
      }
      setSubmitStatus("ok");
      setText("");
      setMessage("Pergunta enviada.");
      loadQuestions();
    } catch {
      setSubmitStatus("error");
      setMessage("Erro de ligação. Verifique a rede.");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <p className="section-label mb-2 pt-12 sm:pt-0">Perguntas ao debate</p>
      <h1 className="font-display mb-4 text-2xl font-semibold tracking-wide uppercase sm:text-3xl">
        Ler e enviar perguntas
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted">
        Todos usam a mesma password do workshop (por defeito{" "}
        <span className="font-mono text-gold">1762</span>) — pode ler as perguntas dos
        outros e enviar a sua. Sem contas nem perfis diferentes.
      </p>

      <label className="mb-2 block font-mono text-[0.65rem] tracking-wider text-gold uppercase">
        Debate
      </label>
      <select
        value={room}
        onChange={(e) => {
          const next = e.target.value;
          if (isQaRoomId(next)) setRoom(next);
        }}
        className="mb-6 w-full border border-gold/25 bg-background/80 px-4 py-3 text-sm text-foreground focus:border-gold/50 focus:outline-none"
      >
        {QA_ROOMS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      {!unlocked ? (
        <div className="card-tactical space-y-4 p-6 sm:p-8">
          <p className="text-sm text-muted">{qaRoomLabel(room)}</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (ex.: 1762)"
            autoComplete="off"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
          />
          <button type="button" onClick={unlock} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      ) : (
        <>
          {storage === "unavailable" && (
            <p className="mb-6 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
              As perguntas não ficam guardadas sem Redis na Vercel. Ligue Upstash Redis ao
              projeto e faça redeploy.
            </p>
          )}

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-sm tracking-[0.12em] text-gold uppercase">
                Perguntas ({questions.length})
              </h2>
              <button
                type="button"
                onClick={loadQuestions}
                className="font-mono text-[0.65rem] text-muted hover:text-gold"
              >
                Atualizar
              </button>
            </div>

            {loadError && <p className="mb-4 text-sm text-muted">{loadError}</p>}

            <ul className="space-y-3">
              {questions.map((q) => (
                <li key={q.id} className="border border-gold/20 bg-surface/60 px-4 py-3">
                  <p className="font-display text-xs tracking-wider text-gold uppercase">
                    {q.author}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{q.text}</p>
                </li>
              ))}
            </ul>

            {questions.length === 0 && !loadError && (
              <p className="text-sm text-muted">Ainda não há perguntas neste debate.</p>
            )}
          </div>

          <form onSubmit={submit} className="card-tactical space-y-4 p-6 sm:p-8">
            <h2 className="font-display text-sm tracking-[0.12em] text-gold uppercase">
              Nova pergunta
            </h2>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nome ou iniciais (opcional)"
              maxLength={40}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="A sua pergunta"
              required
              minLength={8}
              maxLength={300}
              rows={4}
              className="w-full resize-none border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitStatus === "sending"}
              className="btn-primary w-full disabled:opacity-60"
            >
              {submitStatus === "sending" ? "A enviar…" : "Enviar pergunta"}
            </button>
            {message && (
              <p
                className={`text-sm ${submitStatus === "ok" ? "text-gold" : "text-muted"}`}
                role="status"
              >
                {message}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
