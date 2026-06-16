"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerEventData } from "@/app/lib/events/challenger-types";

export function ChallengerPurpose({ event }: { event: ChallengerEventData }) {
  return (
    <section id="finalidade" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">01 · Finalidade</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            O que é o Challenger
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <div className="card-tactical max-w-4xl p-8 sm:p-10">
            <p className="leading-relaxed text-muted">{event.purpose}</p>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
