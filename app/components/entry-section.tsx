"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CASTELO_SRC } from "../lib/site-assets";
import type {
  EntryTeaserInfo,
  EntryUpcomingPreview,
} from "../lib/events/entry-teaser";
import { EntryEventTeaser } from "./entry-event-teaser";

type EntrySectionProps = {
  teasers: EntryTeaserInfo[];
  preview: EntryUpcomingPreview | null;
};

export function EntrySection({
  teasers,
  preview,
}: EntrySectionProps) {
  return (
    <section
      id="entrada"
      className="relative flex min-h-[100dvh] items-start justify-start overflow-hidden pt-[4.5rem] sm:pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/35 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-transparent to-background" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-end">
        <Image
          src={CASTELO_SRC}
          alt=""
          width={1600}
          height={1200}
          priority
          className="castle-entry-bg h-auto min-h-[min(100vh,900px)] w-[min(140vw,1600px)] max-w-none object-contain object-[72%_50%] opacity-[0.36] sm:opacity-[0.42] lg:opacity-[0.48]"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 military-map-overlay opacity-20" />

      <div className="entry-content-zone relative z-10 w-full py-10 pl-5 pr-4 text-left sm:pl-8 sm:pr-6 md:pl-12 lg:py-14 lg:pl-16 xl:pl-24">
        <div className="w-full max-w-xl text-left sm:max-w-2xl">
          <motion.h1
            className="display-heading mb-3 text-left text-5xl font-bold text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="entry-title-o">O</span> Carrista
          </motion.h1>

          <motion.p
            className="font-display mb-5 text-left text-xl font-medium tracking-[0.25em] text-gold uppercase sm:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            De Santa Margarida
          </motion.p>

          <motion.p
            className="mb-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
          >
            A comunidade dos carristas e amigos do Quartel da Cavalaria e do
            RC4. O Carrista de Santa Margarida será local de coordenação de
            eventos, divulgação cultural e histórica, bem como uma rede de
            confiança entre quem serviu e quem continua este legado.
          </motion.p>

          <div className="space-y-3">
            {teasers.map((teaser, index) => (
              <EntryEventTeaser key={teaser.key} teaser={teaser} delay={0.28 + index * 0.06} />
            ))}
            {teasers.length === 0 && (
              <EntryEventTeaser preview={preview} delay={0.28} />
            )}
          </div>
        </div>
      </div>

      <motion.a
        href="#grito"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <span className="section-label text-[0.55rem] text-muted">Scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-gold/60 to-transparent" />
      </motion.a>
    </section>
  );
}
