"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerProva } from "@/app/lib/challenger/types";

function sketchLabel(mime: string | null, label: string | null): string {
  if (label) return label;
  if (!mime) return "Documento";
  if (mime.includes("pdf")) return "Croqui / briefing (PDF)";
  if (mime.includes("presentation") || mime.includes("powerpoint")) {
    return "Croqui / briefing (PPT)";
  }
  return "Croqui / briefing";
}

export function ChallengerProvas({ provas }: { provas: ChallengerProva[] }) {
  return (
    <section id="provas" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">02 · Provas</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Provas e croquis
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        {provas.length === 0 ? (
          <p className="text-sm text-muted">
            As provas e respetivos croquis serão publicados em breve pela organização.
          </p>
        ) : (
          <div className="space-y-8">
            {provas.map((prova, i) => (
              <MotionReveal key={prova.id} delay={i * 0.05}>
                <article className="card-tactical p-6 sm:p-8">
                  <h3 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
                    {prova.title}
                  </h3>
                  {prova.description && (
                    <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
                      {prova.description}
                    </p>
                  )}
                  {prova.sketch_url ? (
                    <a
                      href={prova.sketch_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex border border-gold/30 px-4 py-2 font-display text-[0.65rem] tracking-[0.12em] text-gold uppercase transition-colors hover:border-gold/50 hover:bg-gold/5"
                    >
                      {sketchLabel(prova.sketch_mime, prova.sketch_label)} →
                    </a>
                  ) : (
                    <p className="mt-6 text-[0.7rem] text-muted">
                      Croqui / briefing — documento em breve
                    </p>
                  )}
                </article>
              </MotionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
