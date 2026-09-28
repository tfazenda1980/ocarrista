"use client";

import { useState } from "react";
import { MotionReveal } from "../../motion-reveal";
import type { ImgcEventData } from "@/app/lib/events/imgc-types";
import { useT } from "../../i18n/locale-provider";

export function ImgcSuggestions({ event }: { event: ImgcEventData }) {
  const { t } = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    setError("");
    try {
      const res = await fetch(`/api/imgc/${event.year}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(json.error ?? t("imgc.sendError"));
        return;
      }
      setFeedback(json.message ?? t("imgc.sendOk"));
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(t("common.network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="sugestoes" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("imgc.suggestionsLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("imgc.suggestionsTitle")}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <form onSubmit={submit} className="card-tactical max-w-xl space-y-4 p-8 sm:p-10">
            <p className="text-sm leading-relaxed text-muted">{t("imgc.suggestionsBody")}</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("common.name")}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("common.email")}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("common.message")}
              rows={6}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <div className="hidden" aria-hidden>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {feedback && <p className="text-sm text-gold">{feedback}</p>}
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              {busy ? t("common.sending") : t("common.send")}
            </button>
          </form>
        </MotionReveal>
      </div>
    </section>
  );
}
