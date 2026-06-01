"use client";

import Link from "next/link";
import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";

export function CncContacts({ event }: { event: CncEventData }) {
  const { contacts } = event;

  return (
    <section id="contactos" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">06 · Contactos</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Contactos
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <div className="card-tactical max-w-xl p-8 sm:p-10">
            <p className="font-display text-sm tracking-wide text-gold uppercase">
              {contacts.organizer}
            </p>
            <a
              href={`mailto:${contacts.email}`}
              className="mt-4 block text-lg text-foreground hover:text-gold"
            >
              {contacts.email}
            </a>
            {contacts.phone ? (
              <a
                href={`tel:${contacts.phone.replace(/\s/g, "")}`}
                className="mt-2 block text-muted hover:text-gold"
              >
                {contacts.phone}
              </a>
            ) : null}
            {contacts.notes && (
              <p className="mt-6 text-sm leading-relaxed text-muted">{contacts.notes}</p>
            )}
            <Link href="/#eventos" className="btn-outline mt-8 inline-flex text-xs">
              Voltar à agenda
            </Link>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
