"use client";

import Link from "next/link";
import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";

export function EditionPlaceholder({ event }: { event: EventData }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <MotionReveal>
          <p className="section-label mb-4">{event.edition}</p>
          <h2 className="display-heading mb-6 text-2xl font-semibold sm:text-3xl">
            Arquivo em preparação
          </h2>
          <div className="gold-line mx-auto mb-8 w-24" />
          <p className="leading-relaxed text-muted">
            {event.placeholderMessage ??
              "O conteúdo desta edição estará disponível em breve."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {event.archivePdf && (
              <a href="#arquivo-pdf" className="btn-primary inline-flex">
                Ver caderno do workshop
              </a>
            )}
            {event.year !== "2026" && (
              <Link href="/eventos/workshop/2026" className="btn-outline inline-flex">
                Workshop 2026
              </Link>
            )}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
