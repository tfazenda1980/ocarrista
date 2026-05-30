"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type {
  WorkshopTeaserInfo,
  WorkshopUpcomingPreview,
} from "../lib/events/workshop-teaser";

type EntryEventTeaserProps = {
  teaser: WorkshopTeaserInfo | null;
  preview: WorkshopUpcomingPreview | null;
};

export function EntryEventTeaser({ teaser, preview }: EntryEventTeaserProps) {
  if (teaser) {
    return (
      <motion.div
        className="entry-teaser-active relative mt-5 w-full max-w-xl text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href={teaser.href}
          className="entry-teaser-link group flex items-center gap-3 border border-gold/40 bg-background/55 py-2.5 pl-3.5 pr-3 text-left sm:gap-4 sm:py-3 sm:pl-4 sm:pr-3.5"
        >
          <div className="min-w-0 flex-1">
            <p className="entry-teaser-urgent mb-0.5 font-mono text-[0.55rem] tracking-[0.18em] text-gold uppercase">
              Destaque · {teaser.daysRemaining}{" "}
              {teaser.daysRemaining === 1 ? "dia" : "dias"}
            </p>
            <p className="font-display text-base font-bold leading-tight tracking-wide text-gold uppercase sm:text-lg">
              {teaser.edition}
            </p>
            <p className="font-display text-xs font-semibold tracking-wide text-foreground/95 uppercase sm:text-sm">
              Workshop de Carros de Combate
            </p>
            <p className="mt-1 text-[0.65rem] leading-snug text-muted sm:text-xs">
              {teaser.dateDisplay} · {teaser.location}
            </p>
            <span className="btn-primary mt-2 inline-flex px-3 py-1.5 text-[0.6rem]">
              Entrar no evento →
            </span>
          </div>
          <div className="entry-teaser-thumb relative h-14 w-14 shrink-0 overflow-hidden border border-gold/25 bg-surface/80 sm:h-[4.25rem] sm:w-[4.25rem]">
            <Image
              src={teaser.cardImage}
              alt=""
              fill
              sizes="68px"
              className="event-card-bg object-cover object-center opacity-100"
            />
          </div>
        </Link>
      </motion.div>
    );
  }

  if (preview) {
    return (
      <motion.div
        className="entry-teaser-placeholder relative mt-5 w-full max-w-xl text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.28 }}
      >
        <div className="entry-teaser-placeholder-inner border border-gold/18 bg-background/45 px-3.5 py-2.5 text-left sm:px-4 sm:py-3">
          <div className="absolute inset-0 entry-teaser-placeholder-shine" aria-hidden />
          <div className="relative z-10">
            <p className="section-label mb-1 text-[0.5rem]">Próximo destaque</p>
            <p className="font-display text-sm font-semibold tracking-wide text-gold/90 uppercase sm:text-base">
              {preview.edition}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted sm:text-xs">
              {preview.dateDisplay} · {preview.location}
            </p>
            <p className="mt-1.5 text-[0.65rem] leading-snug text-muted/90 sm:text-xs">
              Alerta três semanas antes do evento.
              {preview.daysUntilTeaser > 0 &&
                ` Daqui a ${preview.daysUntilTeaser} ${preview.daysUntilTeaser === 1 ? "dia" : "dias"}.`}
            </p>
            <Link
              href="/eventos/workshop"
              className="mt-1.5 inline-block font-display text-[0.55rem] tracking-[0.16em] text-gold uppercase hover:underline"
            >
              Workshop anual →
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
