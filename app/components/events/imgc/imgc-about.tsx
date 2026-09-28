"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ImgcEventData } from "@/app/lib/events/imgc-types";
import { useT } from "../../i18n/locale-provider";

export function ImgcAbout({ event }: { event: ImgcEventData }) {
  const { t } = useT();
  return (
    <section id="sobre" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("imgc.aboutLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {event.about.title}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <div className="card-tactical max-w-4xl p-8 sm:p-10">
            <p className="leading-relaxed text-muted">{event.about.body}</p>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
