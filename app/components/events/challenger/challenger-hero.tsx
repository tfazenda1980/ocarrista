"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { ChallengerEventData } from "@/app/lib/events/challenger-types";
import { EventCountdown } from "../countdown";

export function ChallengerHero({ event }: { event: ChallengerEventData }) {
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
      <motion.div style={{ y: bgY }} className="event-hero-visual absolute inset-0">
        <Image
          src={event.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="event-hero-image object-contain object-right-bottom opacity-[0.82] sm:opacity-[0.9]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/58 to-background/12" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
      <div className="absolute inset-0 military-map-overlay opacity-20" />

      <motion.div style={{ opacity }} className="relative z-10 w-full pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-label mb-4">{event.edition}</p>
          <h1 className="display-heading max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">{event.slogan}</p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
            <span>{event.dateDisplay}</span>
            <span className="text-gold/50">·</span>
            <span>{event.location}</span>
          </div>
          <div className="mt-10">
            <EventCountdown targetDate={event.date} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
