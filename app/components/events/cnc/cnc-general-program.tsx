"use client";

import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";

export function CncGeneralProgram({ event }: { event: CncEventData }) {
  const { generalProgram } = event;

  return (
    <section id="programa" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">03 · {generalProgram.title}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {generalProgram.title}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(12rem,16rem)]">
          <MotionReveal delay={0.08}>
            <p className="max-w-3xl leading-relaxed text-muted">{generalProgram.body}</p>
          </MotionReveal>
          {generalProgram.pdf && (
            <MotionReveal delay={0.12}>
              <CncPdfSlot resource={generalProgram.pdf} />
            </MotionReveal>
          )}
        </div>
      </div>
    </section>
  );
}
