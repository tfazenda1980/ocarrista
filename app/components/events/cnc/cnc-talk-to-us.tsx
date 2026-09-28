"use client";

import { useState } from "react";
import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";
import { useT } from "../../i18n/locale-provider";
import { CNC_MESSAGE_KINDS, type CncMessageKind } from "@/app/lib/cnc/messages";
import { cncProvaSelectOptions } from "@/app/lib/cnc/competition-layout";

export function CncTalkToUs({ event }: { event: CncEventData }) {
  const { t } = useT();
  const provaOptions = cncProvaSelectOptions(event.disciplines);
  const [kind, setKind] = useState<CncMessageKind>("contact");
  const [provaId, setProvaId] = useState(provaOptions[0]?.id ?? "");
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
      const res = await fetch(`/api/cnc/${event.year}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          provaId: kind === "prova" ? provaId : "",
          name,
          email,
          message,
          website,
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(json.error ?? t("cnc.sendError"));
        return;
      }
      setFeedback(json.message ?? t("cnc.sendOk"));
      setName("");
      setEmail("");
      setMessage("");
      setKind("contact");
    } catch {
      setError(t("common.network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="fale-connosco" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("cnc.talkLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("cnc.talkTitle")}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <form onSubmit={submit} className="card-tactical max-w-xl space-y-4 p-8 sm:p-10">
            <p className="text-sm leading-relaxed text-muted">
              {t("cnc.talkBody")}
            </p>
            <label className="block text-xs tracking-wide text-muted uppercase">
              {t("cnc.type")}
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as CncMessageKind)}
                className="mt-2 w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground normal-case"
              >
                {CNC_MESSAGE_KINDS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(
                      item.id === "contact"
                        ? "cnc.kindContact"
                        : item.id === "prova"
                          ? "cnc.kindProva"
                          : "cnc.kindSuggestion",
                    )}
                  </option>
                ))}
              </select>
            </label>
            {kind === "prova" && (
              <label className="block text-xs tracking-wide text-muted uppercase">
                {t("cnc.class")}
                <select
                  value={provaId}
                  onChange={(e) => setProvaId(e.target.value)}
                  className="mt-2 w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground normal-case"
                  required
                >
                  {provaOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
