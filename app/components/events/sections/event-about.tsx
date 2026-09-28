"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";
import { useT } from "../../i18n/locale-provider";

export function EventAbout({ event }: { event: EventData }) {
  const { t } = useT();
  return (
    <section id="sobre" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("common.aboutEvent")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("workshop.aboutTitle")}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <MotionReveal delay={0.08}>
            <div className="card-tactical p-8 sm:p-10">
              <h3 className="font-display mb-4 text-lg tracking-wide text-gold uppercase">
                {t("workshop.purpose")}
              </h3>
              <p className="leading-relaxed text-muted">{event.purpose}</p>
            </div>
          </MotionReveal>
          <MotionReveal delay={0.14}>
            <div className="card-tactical p-8 sm:p-10">
              <h3 className="font-display mb-4 text-lg tracking-wide text-gold uppercase">
                {t("workshop.objectives")}
              </h3>
              <ul className="space-y-3">
                {event.objectives.map((obj) => (
                  <li
                    key={obj}
                    className="flex gap-3 text-sm leading-relaxed text-muted sm:text-base"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-gold" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
