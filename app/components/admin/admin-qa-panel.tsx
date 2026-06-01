"use client";

import { useCallback, useEffect, useState } from "react";
import { QA_ROOMS } from "@/app/lib/workshop-qa/rooms";
import type { QaQuestion, QaRoomId } from "@/app/lib/workshop-qa/types";

export function AdminQaPanel({ year }: { year: string }) {
  const [room, setRoom] = useState<QaRoomId>("debate-painel-1");
  const [questions, setQuestions] = useState<QaQuestion[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/workshop/${year}/qa?room=${room}`);
    if (res.status === 401) {
      window.location.href = "/entrar";
      return;
    }
    const data = (await res.json()) as { questions?: QaQuestion[] };
    setQuestions(data.questions ?? []);
  }, [room, year]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 5000);
    return () => window.clearInterval(id);
  }, [load]);

  const remove = async (id: string) => {
    await fetch(`/api/admin/workshop/${year}/qa?room=${room}&id=${id}`, {
      method: "DELETE",
    });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {QA_ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoom(r.id)}
            className={room === r.id ? "btn-primary px-4 py-2 text-xs" : "btn-outline px-4 py-2 text-xs"}
          >
            {r.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="card-tactical p-4">
            <p className="text-xs text-gold">{q.author}</p>
            <p className="mt-1 text-sm">{q.text}</p>
            <button
              type="button"
              onClick={() => remove(q.id)}
              className="mt-3 font-mono text-[0.65rem] text-muted hover:text-gold"
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>
      {questions.length === 0 && (
        <p className="text-sm text-muted">Sem perguntas neste debate.</p>
      )}
    </div>
  );
}
