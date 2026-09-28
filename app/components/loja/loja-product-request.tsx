"use client";

import { useState } from "react";
import { useT } from "../i18n/locale-provider";

type LojaProductRequestProps = {
  productName: string;
};

export function LojaProductRequest({ productName }: LojaProductRequestProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/loja/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, note }),
    });
    const data = (await res.json()) as { message?: string; error?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? t("loja.error"));
      return;
    }
    setStatus("ok");
    setMessage(data.message ?? t("loja.ok"));
    setOpen(false);
    setNote("");
  };

  if (status === "ok") {
    return (
      <p className="font-display text-[0.65rem] tracking-[0.12em] text-gold uppercase">
        {t("loja.sent")}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-display text-[0.65rem] tracking-[0.15em] text-gold uppercase hover:underline"
      >
        {t("loja.request")}
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("loja.notePlaceholder")}
        rows={2}
        className="w-full resize-none border border-gold/20 bg-background/80 px-2 py-1.5 text-xs focus:border-gold/50 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={status === "loading"}
          onClick={submit}
          className="btn-primary flex-1 px-2 py-1.5 text-[0.65rem]"
        >
          {status === "loading" ? t("loja.sending") : t("loja.send")}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setNote("");
            setStatus("idle");
          }}
          className="btn-outline px-2 py-1.5 text-[0.65rem]"
        >
          {t("loja.cancel")}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-muted">{message}</p>}
    </div>
  );
}
