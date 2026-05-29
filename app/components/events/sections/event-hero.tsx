"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { EventData } from "../../../lib/events/types";
import { EventCountdown } from "../countdown";

type EventHeroProps = {
  event: EventData;
};

export function EventHero({ event }: EventHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="event-hero relative flex min-h-[100dvh] items-end overflow-hidden pt-20"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
        <Image
          src={event.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-right-bottom opacity-[0.38] sm:opacity-[0.48]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 military-map-overlay opacity-30" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:pb-28"
      >
        <Link
          href="/#eventos"
          className="section-label mb-8 inline-flex items-center gap-2 text-gold/80 transition-colors hover:text-gold"
        >
          ← Agenda O Carrista
        </Link>
        <p className="font-mono mb-3 text-[0.7rem] tracking-[0.25em] text-gold uppercase">
          {event.edition}
        </p>
        <motion.h1
          className="display-heading max-w-4xl text-4xl font-bold text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {event.title}
        </motion.h1>
        <motion.p
          className="mt-4 max-w-2xl text-lg text-muted sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
        >
          {event.slogan}
        </motion.p>
        <motion.div
          className="mt-6 flex flex-wrap gap-4 text-sm text-foreground sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="border border-gold/25 bg-gold/5 px-3 py-1.5 font-display tracking-wide uppercase">
            {event.dateDisplay}
          </span>
          <span className="border border-gold/15 px-3 py-1.5 text-muted">
            {event.location}
          </span>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <p className="section-label mb-3">Contagem decrescente</p>
          <EventCountdown targetDate={event.date} />
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <a href="#inscricao" className="btn-primary">
            {event.registration.cta}
          </a>
          <a href="#programa" className="btn-outline">
            Ver programa
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
