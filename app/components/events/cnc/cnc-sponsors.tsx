"use client";

import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";

export function CncSponsors({ event }: { event: CncEventData }) {
  const sponsors = event.sponsors.filter((sponsor) => sponsor.logo);

  return (
    <section id="patrocinadores" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">10 · Patrocinadores</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Patrocinadores
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        {sponsors.length === 0 ? (
          <MotionReveal delay={0.08}>
            <p className="max-w-xl text-muted">
              Os patrocinadores desta edição serão publicados em breve.
            </p>
          </MotionReveal>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {sponsors.map((sponsor, index) => {
              const card = (
                <div className="card-tactical aspect-square overflow-hidden transition-colors hover:border-gold/40 hover:bg-gold/5">
                  <div className="flex h-full w-full items-center justify-center p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="h-full w-full object-contain opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </div>
              );

              return (
                <li key={sponsor.id || sponsor.name} className="h-full">
                  <MotionReveal delay={index * 0.04} className="h-full">
                    {sponsor.url ? (
                      <a
                        href={sponsor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={sponsor.name}
                        className="group block h-full"
                      >
                        {card}
                      </a>
                    ) : (
                      <div className="group h-full">{card}</div>
                    )}
                  </MotionReveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
