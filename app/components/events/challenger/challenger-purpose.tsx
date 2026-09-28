"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerEventData } from "@/app/lib/events/challenger-types";
import { useT } from "../../i18n/locale-provider";

export function ChallengerPurpose({ event }: { event: ChallengerEventData }) {
  const { t } = useT();
  return (
    <section id="finalidade" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("challenger.purposeLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("challenger.purposeTitle")}
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
