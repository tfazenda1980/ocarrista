"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MotionReveal } from "../../motion-reveal";
import { IconShield, IconTarget } from "../../icons";
import type { EventData } from "../../../lib/events/types";

const icons = [<IconShield key="s" />, <IconTarget key="t" />];

export function EventThemes({ event }: { event: EventData }) {
  const [openId, setOpenId] = useState<string | null>(event.themes[0]?.id ?? null);

  return (
    <section id="temas" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">02 · Temas principais</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Eixos do Workshop
          </h2>
          <div className="gold-line mb-12 w-24" />
        </MotionReveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {event.themes.map((theme, i) => {
            const isOpen = openId === theme.id;
            return (
              <MotionReveal key={theme.id} delay={i * 0.08}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : theme.id)}
                  className={`event-theme-card w-full text-left transition-colors ${
                    isOpen ? "border-gold/45 bg-gold/5" : ""
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center border border-gold/35 text-gold">
                    {icons[i % icons.length]}
                  </div>
                  <p className="font-mono mb-1 text-[0.65rem] text-gold-dim uppercase">
                    {theme.subtitle}
                  </p>
                  <h3 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase">
                    {theme.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {theme.description}
                  </p>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 border-t border-gold/15 pt-4 text-sm leading-relaxed text-muted/90">
                          {theme.details}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="mt-4 inline-block font-display text-[0.6rem] tracking-[0.2em] text-gold uppercase">
                    {isOpen ? "Fechar" : "Expandir tema"}
                  </span>
                </button>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
