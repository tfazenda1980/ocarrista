"use client";

import { useState } from "react";
import { MotionReveal } from "../../motion-reveal";
import type { ImgcDelegation, ImgcEventData } from "@/app/lib/events/imgc-types";
import { useT } from "../../i18n/locale-provider";

function pinPercent(delegation: ImgcDelegation) {
  const left = ((delegation.lng + 180) / 360) * 100;
  const top = ((90 - delegation.lat) / 180) * 100;
  return {
    left: `${Math.min(98, Math.max(2, left))}%`,
    top: `${Math.min(96, Math.max(4, top))}%`,
  };
}

export function ImgcDelegationsMap({ event }: { event: ImgcEventData }) {
  const { t } = useT();
  const [activeId, setActiveId] = useState<string | null>(
    event.delegations.find((d) => d.host)?.id ?? event.delegations[0]?.id ?? null,
  );
  const active = event.delegations.find((d) => d.id === activeId) ?? null;

  return (
    <section id="delegacoes" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("imgc.delegationsLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("imgc.delegationsTitle")}
          </h2>
          <div className="gold-line mb-6 w-24" />
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted">
            {t("imgc.delegationsIntro")}
          </p>
        </MotionReveal>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <MotionReveal>
            <div className="relative overflow-hidden border border-gold/20 bg-[#0c1210]">
              <svg
                viewBox="0 0 360 180"
                className="block h-auto w-full opacity-90"
                aria-hidden
              >
                <rect width="360" height="180" fill="#0c1210" />
                {[30, 60, 90, 120, 150].map((y) => (
                  <line
                    key={`lat-${y}`}
                    x1="0"
                    y1={y}
                    x2="360"
                    y2={y}
                    stroke="rgba(201,169,98,0.12)"
                    strokeWidth="0.4"
                  />
                ))}
                {[60, 120, 180, 240, 300].map((x) => (
                  <line
                    key={`lng-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="180"
                    stroke="rgba(201,169,98,0.1)"
                    strokeWidth="0.4"
                  />
                ))}
                <path
                  fill="rgba(201,169,98,0.18)"
                  stroke="rgba(201,169,98,0.35)"
                  strokeWidth="0.6"
                  d="M48 38 L78 28 L118 36 L128 48 L112 68 L78 72 L52 58 Z"
                />
                <path
                  fill="rgba(201,169,98,0.16)"
                  stroke="rgba(201,169,98,0.32)"
                  strokeWidth="0.6"
                  d="M98 88 L118 82 L128 118 L112 148 L98 142 L90 108 Z"
                />
                <path
                  fill="rgba(201,169,98,0.2)"
                  stroke="rgba(201,169,98,0.38)"
                  strokeWidth="0.6"
                  d="M168 38 L198 32 L208 42 L192 52 L172 50 Z"
                />
                <path
                  fill="rgba(201,169,98,0.18)"
                  stroke="rgba(201,169,98,0.34)"
                  strokeWidth="0.6"
                  d="M168 52 L208 48 L218 88 L198 118 L178 108 L168 78 Z"
                />
                <path
                  fill="rgba(201,169,98,0.2)"
                  stroke="rgba(201,169,98,0.36)"
                  strokeWidth="0.6"
                  d="M208 32 L268 28 L318 48 L302 72 L248 68 L218 52 Z"
                />
                <path
                  fill="rgba(201,169,98,0.16)"
                  stroke="rgba(201,169,98,0.3)"
                  strokeWidth="0.6"
                  d="M278 98 L318 108 L332 122 L308 128 L278 118 Z"
                />
                <ellipse cx="248" cy="22" rx="18" ry="10" fill="rgba(201,169,98,0.14)" />
              </svg>

              {event.delegations.map((delegation) => {
                const pos = pinPercent(delegation);
                const isActive = delegation.id === activeId;
                return (
                  <button
                    key={delegation.id}
                    type="button"
                    style={pos}
                    onClick={() => setActiveId(delegation.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition ${
                      delegation.host
                        ? "h-4 w-4 border-gold bg-gold shadow-[0_0_18px_rgba(201,169,98,0.85)]"
                        : isActive
                          ? "h-3.5 w-3.5 border-gold bg-gold/80"
                          : "h-3 w-3 border-gold/70 bg-gold/50 hover:bg-gold"
                    }`}
                    aria-label={delegation.country}
                  />
                );
              })}
            </div>
          </MotionReveal>

          <div>
            <p className="font-display mb-4 text-xs tracking-[0.16em] text-gold uppercase">
              {t("imgc.delegationsList")}
            </p>
            {event.delegations.length === 0 ? (
              <p className="text-sm text-muted">{t("imgc.delegationsEmpty")}</p>
            ) : (
              <ul className="space-y-2">
                {event.delegations.map((delegation) => (
                  <li key={delegation.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(delegation.id)}
                      className={`w-full border px-4 py-3 text-left transition ${
                        delegation.id === activeId
                          ? "border-gold bg-gold/10"
                          : "border-gold/15 hover:border-gold/40"
                      }`}
                    >
                      <span className="font-display text-sm tracking-wide text-foreground uppercase">
                        {delegation.country}
                      </span>
                      {delegation.city && (
                        <span className="mt-1 block text-xs text-muted">{delegation.city}</span>
                      )}
                      {delegation.host && (
                        <span className="mt-2 inline-block font-mono text-[0.6rem] tracking-[0.16em] text-gold uppercase">
                          {t("imgc.hostNation")}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {active && (
              <p className="mt-6 text-xs text-muted">
                {active.country}
                {active.city ? ` · ${active.city}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
