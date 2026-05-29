"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CASTELO_SRC } from "../lib/site-assets";
import { UnitCrest } from "./unit-crest";

export function EntrySection() {
  return (
    <section
      id="entrada"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src={CASTELO_SRC}
          alt=""
          width={900}
          height={900}
          priority
          className="castle-entry-bg h-auto max-h-[min(92vh,900px)] w-auto max-w-[min(95vw,900px)] object-contain opacity-[0.14] sm:opacity-[0.18]"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 military-map-overlay opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="max-w-3xl">
            <motion.p
              className="section-label mb-4 flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block h-px w-8 bg-gold/60" />
              Regimento de Cavalaria 4 · Ex-RC4
            </motion.p>

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

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
            >
              <motion.a href="#comunidade" className="btn-primary" whileHover={{ y: -2 }}>
                Aderir à Comunidade
              </motion.a>
              <motion.a href="#loja" className="btn-outline" whileHover={{ y: -2 }}>
                Loja do Carrista
              </motion.a>
            </motion.div>

            <motion.dl
              className="mt-16 grid grid-cols-3 gap-4 border-t border-gold/15 pt-8 sm:gap-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.4 }}
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

          <motion.div
            className="hidden justify-center lg:flex"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <UnitCrest size="xl" priority variant="bare" />
          </motion.div>
        </div>

        <motion.div
          className="mt-10 flex justify-center lg:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <UnitCrest size="lg" priority variant="bare" />
        </motion.div>
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
