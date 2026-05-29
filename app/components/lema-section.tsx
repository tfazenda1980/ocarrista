"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LEMA_QCAV_RC4 } from "../lib/site-assets";

export function LemaSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.45, once: true });

  return (
    <section
      id="lema"
      ref={ref}
      className="relative flex min-h-[55vh] scroll-mt-20 items-center justify-center overflow-hidden border-b border-gold/10 bg-background py-20 sm:min-h-[60vh] sm:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(198,164,75,0.08),transparent_72%)]" />
      <div className="absolute inset-0 opacity-15 military-map-overlay" />

      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6"
        initial={{ opacity: 0, y: 36 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label mb-6">Lema do QCav e do RC4</p>
        <motion.blockquote
          className="font-display text-2xl font-medium leading-snug tracking-[0.08em] text-foreground uppercase sm:text-3xl md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          &ldquo;{LEMA_QCAV_RC4}&rdquo;
        </motion.blockquote>
        <div className="gold-line mx-auto mt-10 w-32" />
      </motion.div>
    </section>
  );
}
