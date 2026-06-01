"use client";

import Image from "next/image";
import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";

export function CncSponsors({ event }: { event: CncEventData }) {
  const { sponsors } = event;

  return (
    <section id="patrocinadores" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">07 · Patrocinadores</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Patrocinadores
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        {sponsors.length === 0 ? (
          <MotionReveal delay={0.08}>
            <p className="max-w-xl text-muted">
              Os patrocinadores desta edição serão publicados em breve. Para integrar o seu
              logótipo, adicione entradas em{" "}
              <code className="text-gold/90">content/events/cnc/{event.year}.json</code>{" "}
              (campo <code className="text-gold/90">sponsors</code>).
            </p>
          </MotionReveal>
        ) : (
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor, index) => (
              <MotionReveal key={sponsor.name} delay={index * 0.04}>
                <li>
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-tactical flex aspect-[3/2] items-center justify-center p-6 transition-colors hover:border-gold/40 hover:bg-gold/5"
                  >
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={200}
                      height={80}
                      className="max-h-16 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
                    />
                  </a>
                </li>
              </MotionReveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
