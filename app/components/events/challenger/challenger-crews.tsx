"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerCrew } from "@/app/lib/challenger/types";

export function ChallengerCrews({ crews }: { crews: ChallengerCrew[] }) {
  return (
    <section id="guarnicoes" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">03 · Guarnições</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Guarnições inscritas
          </h2>
          <div className="gold-line mb-10 w-24" />
          <p className="mb-10 max-w-2xl text-sm text-muted">
            Cada guarnição é constituída por quatro elementos. A lista reflecte as inscrições
            confirmadas para esta edição.
          </p>
        </MotionReveal>

        {crews.length === 0 ? (
          <p className="text-sm text-muted">Ainda não há guarnições publicadas.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {crews.map((crew, i) => (
              <MotionReveal key={crew.id} delay={i * 0.04}>
                <div className="card-tactical h-full p-6">
                  <h3 className="font-display text-lg font-semibold tracking-wide text-gold uppercase">
                    {crew.name}
                  </h3>
                  <ol className="mt-4 space-y-2">
                    {crew.members.map((member) => (
                      <li
                        key={member.id}
                        className="flex items-baseline justify-between gap-3 border-b border-gold/10 pb-2 text-sm last:border-0"
                      >
                        <span className="text-foreground">{member.name}</span>
                        {member.role && (
                          <span className="shrink-0 font-mono text-[0.65rem] text-muted">
                            {member.role}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </MotionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
