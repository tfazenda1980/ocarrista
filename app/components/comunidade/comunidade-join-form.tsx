"use client";

import { useState } from "react";

export function ComunidadeJoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/comunidade/adesao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Não foi possível enviar o pedido.");
        return;
      }
      setStatus("ok");
      setMessage(
        data.message ??
          "Pedido recebido. Receberá email quando a adesão for aprovada.",
      );
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Erro de ligação.");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome completo"
        required
        autoComplete="name"
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        autoComplete="email"
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
      />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? "A enviar…" : "Solicitar adesão"}
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
  );
}
