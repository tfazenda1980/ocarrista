"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MotionReveal } from "../../motion-reveal";
import type { EventData, EventSpeaker } from "../../../lib/events/types";
import { speakerHashId } from "../../../lib/events/speaker-links";

function SpeakerInitials({ name }: { name: string }) {
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <span className="font-display text-2xl font-bold text-gold uppercase">
      {initials}
    </span>
  );
}

export function EventSpeakers({
  event,
  hideModerators = false,
}: {
  event: EventData;
  hideModerators?: boolean;
}) {
  const [selected, setSelected] = useState<EventSpeaker | null>(null);

  return (
    <section id="oradores" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">04 · Oradores</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Vozes de referência
          </h2>
          <div className="gold-line mb-12 w-24" />
        </MotionReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {event.speakers.map((speaker, i) => (
            <MotionReveal key={speaker.id} delay={i * 0.07}>
              <button
                id={speakerHashId(speaker)}
                type="button"
                onClick={() => {
                  window.location.hash = speakerHashId(speaker);
                  setSelected(speaker);
                }}
                className="event-speaker-card group w-full scroll-mt-28 text-left"
              >
                <div className="mb-4 flex aspect-[4/5] max-h-48 items-center justify-center border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent transition-colors group-hover:border-gold/45">
                  <SpeakerInitials name={speaker.name} />
                </div>
                <h3 className="font-display text-base font-semibold tracking-wide text-foreground uppercase">
                  {speaker.name}
                </h3>
                <p className="mt-1 text-sm text-gold">{speaker.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                  {speaker.bio}
                </p>
                <span className="mt-4 inline-block font-display text-[0.6rem] tracking-[0.18em] text-gold uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  Ver perfil →
                </span>
              </button>
            </MotionReveal>
          ))}
        </div>

        {!hideModerators && event.moderators && event.moderators.length > 0 && (
          <MotionReveal className="mt-16">
            <p className="section-label mb-3">Moderadores</p>
            <h3 className="font-display mb-6 text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
              Condução dos painéis
            </h3>
            <ul className="flex flex-wrap gap-4">
              {event.moderators.map((mod) => (
                <li
                  key={mod.id}
                  className="event-speaker-card border border-gold/25 px-5 py-4"
                >
                  <p className="font-display text-base font-semibold tracking-wide text-foreground uppercase">
                    {mod.name}
                  </p>
                  <p className="mt-1 text-sm text-gold">Moderador</p>
                </li>
              ))}
            </ul>
          </MotionReveal>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
            <motion.div
              role="dialog"
              aria-modal
              aria-labelledby="speaker-modal-title"
              className="card-tactical relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto p-8 sm:p-10"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 font-mono text-xs text-muted hover:text-gold"
              >
                FECHAR
              </button>
              <div className="mb-6 flex h-20 w-20 items-center justify-center border border-gold/30 bg-gold/5">
                <SpeakerInitials name={selected.name} />
              </div>
              <h3
                id="speaker-modal-title"
                className="font-display text-xl font-semibold tracking-wide uppercase"
              >
                {selected.name}
              </h3>
              <p className="mt-1 text-gold">{selected.role}</p>
              <p className="mt-6 leading-relaxed text-muted">
                {selected.bioLong ?? selected.bio}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
