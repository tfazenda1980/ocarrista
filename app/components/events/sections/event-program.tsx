"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";

export function EventProgram({ event }: { event: EventData }) {
  return (
    <section id="programa" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">03 · Programa</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Agenda do dia
          </h2>
          <div className="gold-line mb-14 w-24" />
        </MotionReveal>

        <div className="grid gap-16 lg:grid-cols-2">
          {event.panels.map((panel, panelIndex) => (
            <MotionReveal key={panel.name} delay={panelIndex * 0.1}>
              <h3 className="font-display mb-8 text-lg tracking-[0.12em] text-gold uppercase">
                {panel.name}
              </h3>
              <ol className="event-timeline relative space-y-0">
                {panel.sessions.map((session, i) => (
                  <li key={`${session.time}-${session.title}`} className="relative pb-10 pl-10 last:pb-0">
                    <span className="absolute left-0 top-1.5 h-3 w-3 border border-gold bg-background" />
                    {i < panel.sessions.length - 1 && (
                      <span className="absolute bottom-0 left-[5px] top-4 w-px bg-gradient-to-b from-gold/50 to-gold/10" />
                    )}
                    <time className="font-mono text-xs tracking-wider text-gold">
                      {session.time}
                    </time>
                    <p
                      className={`mt-1 font-display text-base tracking-wide uppercase sm:text-lg ${
                        session.highlight ? "text-gold" : "text-foreground"
                      }`}
                    >
                      {session.title}
                    </p>
                    {session.speaker && (
                      <p className="mt-1 text-sm text-muted">{session.speaker}</p>
                    )}
                    {session.highlight && (
                      <span className="mt-2 inline-block border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[0.55rem] tracking-wider text-gold uppercase">
                        Sessão principal
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
