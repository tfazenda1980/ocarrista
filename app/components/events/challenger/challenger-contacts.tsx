"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerEventData } from "@/app/lib/events/challenger-types";

export function ChallengerContacts({ event }: { event: ChallengerEventData }) {
  return (
    <section id="contactos" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">05 · Contactos</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Organização
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <div className="card-tactical max-w-lg p-8">
            <p className="text-sm text-muted">{event.contacts.organizer}</p>
            <a
              href={`mailto:${event.contacts.email}`}
              className="mt-4 inline-block font-display text-sm tracking-[0.1em] text-gold uppercase hover:text-gold-bright"
            >
              {event.contacts.email}
            </a>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
