"use client";

import { useState } from "react";
import { useT } from "../i18n/locale-provider";

export function ComunidadeJoinForm() {
  const { t } = useT();
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
        setMessage(data.error ?? t("join.error"));
        return;
      }
      setStatus("ok");
      setMessage(
        data.message ??
        data.message ?? t("join.ok"),
      );
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t("join.network"));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("join.name")}
        required
        autoComplete="name"
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("join.email")}
        required
        autoComplete="email"
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
      />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? t("join.sending") : t("join.submit")}
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
