"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QA_ROOMS, isQaRoomId, qaRoomLabel } from "@/app/lib/workshop-qa/rooms";
import type { QaRoomId } from "@/app/lib/workshop-qa/types";

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
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey(year, room));
    if (saved) {
      setPassword(saved);
      setUnlocked(true);
    } else {
      setUnlocked(false);
    }
  }, [year, room]);

  const unlock = useCallback(() => {
    if (!password.trim()) return;
    sessionStorage.setItem(storageKey(year, room), password.trim());
    setUnlocked(true);
    setMessage("");
  }, [password, room, year]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
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
        setStatus("error");
        setMessage(data.error ?? "Não foi possível enviar.");
        return;
      }
      setStatus("ok");
      setText("");
      setMessage("Pergunta enviada. O moderador poderá selecioná-la para o debate.");
    } catch {
      setStatus("error");
      setMessage("Erro de ligação. Verifique a rede.");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/eventos/workshop/${year}`}
        className="mb-8 inline-block font-mono text-xs tracking-wider text-muted hover:text-gold"
      >
        ← Voltar ao Workshop
      </Link>

      <p className="section-label mb-2">Perguntas ao debate</p>
      <h1 className="font-display mb-4 text-2xl font-semibold tracking-wide uppercase sm:text-3xl">
        Enviar pergunta
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted">
        Introduza a password que o moderador anunciar na sala. Não é necessário criar conta.
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
            placeholder="Password do público"
            autoComplete="off"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
          />
          <button type="button" onClick={unlock} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card-tactical space-y-4 p-6 sm:p-8">
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
            disabled={status === "sending"}
            className="btn-primary w-full disabled:opacity-60"
          >
            {status === "sending" ? "A enviar…" : "Enviar pergunta"}
          </button>
          {message && (
            <p
              className={`text-sm ${status === "ok" ? "text-gold" : "text-muted"}`}
              role="status"
            >
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
