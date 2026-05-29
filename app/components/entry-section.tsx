"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CASTELO_SRC } from "../lib/site-assets";

export function EntrySection() {
  return (
    <section
      id="entrada"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src={CASTELO_SRC}
          alt=""
          width={1100}
          height={1100}
          priority
          className="castle-entry-bg h-auto max-h-[min(96vh,1100px)] w-auto max-w-[min(98vw,1100px)] object-contain opacity-[0.32] sm:opacity-[0.38] lg:opacity-[0.42]"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 military-map-overlay opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-3xl">
            <motion.h1
              className="display-heading mb-3 text-5xl font-bold text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              O Carrista
            </motion.h1>

            <motion.p
              className="font-display mb-6 text-xl font-medium tracking-[0.25em] text-gold uppercase sm:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              De Santa Margarida
            </motion.p>

            <motion.p
              className="mb-10 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
            >
              A comunidade dos carristas e amigos do Quartel da Cavalaria e do
              RC4. O Carrista de Santa Margarida será local de coordenação de
              eventos, divulgação cultural e histórica, bem como uma rede de
              confiança entre quem serviu e quem continua este legado.
            </motion.p>

            <motion.dl
              className="mt-12 grid grid-cols-3 gap-4 border-t border-gold/15 pt-8 sm:gap-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
            >
              {[
                { value: "7", label: "Eventos Anuais" },
                { value: "RC4", label: "Regimento de Cavalaria 4" },
                { value: "GesCO", label: "Gestão Integrada" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold text-gold sm:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[0.65rem] leading-snug tracking-wide text-muted uppercase sm:text-xs">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </motion.dl>
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
