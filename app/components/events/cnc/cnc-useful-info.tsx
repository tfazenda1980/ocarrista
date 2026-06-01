"use client";

import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";

export function CncUsefulInfo({ event }: { event: CncEventData }) {
  return (
    <section id="informacao" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">05 · Informação útil</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Informação útil
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <div className="grid gap-8 sm:grid-cols-2">
          {event.usefulInfo.map((item, index) => (
            <MotionReveal key={item.id} delay={index * 0.05}>
              <div id={`info-${item.id}`} className="scroll-mt-28">
                <h3 className="font-display mb-2 text-lg tracking-wide text-gold uppercase">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mb-4 text-sm text-muted">{item.description}</p>
                )}
                <CncPdfSlot resource={item.pdf} />
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
