"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";
import { EventProgramItem } from "./event-program-item";

/** Programa linear (sem layout por eixos) */
export function EventProgram({ event }: { event: EventData }) {
  const hasAxes = event.themes.length >= 2 && event.panels.some((p) => p.axisId);
  if (hasAxes) return null;

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

        <div className="space-y-16 lg:space-y-20">
          {event.panels.map((panel, panelIndex) => (
            <MotionReveal key={panel.name} delay={panelIndex * 0.08}>
              <div className="event-program-block">
                <h3 className="font-display mb-8 border-b border-gold/20 pb-4 text-lg tracking-[0.12em] text-gold uppercase sm:text-xl">
                  {panel.name}
                </h3>
                <ol className="event-program-list">
                  {panel.sessions.map((session) => (
                    <EventProgramItem
                      key={`${session.time}-${session.title}`}
                      session={session}
                      speakers={event.speakers}
                    />
                  ))}
                </ol>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
