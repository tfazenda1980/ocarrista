"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";
import { timeLabel } from "./event-program-item";

export function EventSpotlight({ event }: { event: EventData }) {
  const item = event.spotlight;
  if (!item) return null;

  return (
    <section
      id="destaque"
      className="event-section scroll-mt-24 border-y border-gold/20 bg-gradient-to-r from-gold/10 via-surface/60 to-gold/5 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">Destaque do dia</p>
          <div className="event-spotlight-banner">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <time className="font-mono text-sm tracking-wider text-gold">
                {timeLabel(item)}
              </time>
              {item.duration && (
                <span className="event-program-duration font-mono text-[0.65rem] tracking-wider text-gold uppercase">
                  {item.duration}
                </span>
              )}
            </div>
            <h2 className="font-display mt-4 text-2xl font-semibold tracking-wide text-gold uppercase sm:text-3xl">
              {item.title}
            </h2>
            {item.description && (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
                {item.description}
              </p>
            )}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
