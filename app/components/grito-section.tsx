"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GRITO_LINHA_1, GRITO_LINHA_2 } from "../lib/site-assets";

export function GritoSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.45, once: true });

  return (
    <section
      id="grito"
      ref={ref}
      className="relative flex min-h-[70vh] scroll-mt-20 items-center justify-center overflow-hidden border-y border-gold/10 bg-surface/60 py-24 sm:min-h-[75vh] sm:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(198,164,75,0.12),transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 military-map-overlay" />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 40, scale: 0.96 }
        }
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label mb-6">Grito d&apos;O Carrista</p>
        <p className="font-display text-2xl font-medium tracking-[0.12em] text-foreground uppercase sm:text-3xl md:text-4xl">
          {GRITO_LINHA_1}
        </p>
        <motion.p
          className="display-heading mt-4 text-5xl font-bold text-gold sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {GRITO_LINHA_2}
        </motion.p>
        <div className="gold-line mx-auto mt-10 w-32" />
      </motion.div>
    </section>
  );
}
