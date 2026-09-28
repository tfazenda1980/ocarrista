"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerProva } from "@/app/lib/challenger/types";
import { ChallengerProvaSketch } from "./challenger-prova-sketch";
import { useT } from "../../i18n/locale-provider";

export function ChallengerProvas({ provas }: { provas: ChallengerProva[] }) {
  const { t } = useT();
  return (
    <section id="provas" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("challenger.provasLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("challenger.provasTitle")}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        {provas.length === 0 && (
          <p className="text-sm text-muted">
            {t("challenger.provasEmpty")}
          </p>
        )}
      </div>

      {provas.length > 0 && (
        <div className="space-y-12">
          {provas.map((prova, i) => (
            <MotionReveal key={prova.id} delay={i * 0.05}>
              <div>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <article className="card-tactical p-6 sm:p-8">
                    <h3 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
                      {prova.title}
                    </h3>
                    {prova.description && (
                      <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
                        {prova.description}
                      </p>
                    )}
                    {!prova.sketch_url && (
                      <p className="mt-6 text-[0.7rem] text-muted">
                        {t("challenger.sketchSoon")}
                      </p>
                    )}
                  </article>
                </div>
                {prova.sketch_url && <ChallengerProvaSketch prova={prova} />}
              </div>
            </MotionReveal>
          ))}
        </div>
      )}
    </section>
  );
}
