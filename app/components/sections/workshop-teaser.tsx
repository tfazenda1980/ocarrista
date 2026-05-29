"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { WORKSHOP_26_SRC } from "../../lib/site-assets";

export function WorkshopTeaserSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section
      id="workshop-2026"
      ref={ref}
      className="relative scroll-mt-20 overflow-hidden border-y border-gold/10 bg-surface/50 py-20 sm:py-28"
    >
      <div className="absolute inset-0 military-map-overlay opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(198,164,75,0.14),transparent_65%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <p className="section-label mb-3">Evento em destaque</p>
        <h2 className="display-heading mb-4 max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
          Workshop 2026
        </h2>
        <div className="gold-line mb-10 w-24" />

        <Link
          href="/eventos/workshop-2026"
          className="event-teaser-card group relative block overflow-hidden border border-gold/20 bg-background/80 p-6 sm:p-10"
        >
          <motion.div
            style={{ y: imageY }}
            className="pointer-events-none absolute -right-4 bottom-0 top-0 w-[min(55%,420px)] sm:w-[min(48%,480px)]"
          >
            <Image
              src={WORKSHOP_26_SRC}
              alt=""
              fill
              sizes="(max-width: 768px) 55vw, 480px"
              className="object-contain object-bottom opacity-[0.45] transition-opacity duration-700 group-hover:opacity-[0.62]"
              aria-hidden
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />

          <div className="relative z-10 max-w-xl">
            <p className="font-mono mb-2 text-[0.65rem] tracking-wider text-gold uppercase">
              Workshop de Carros de Combate · Edição 2026
            </p>
            <p className="mb-6 text-base leading-relaxed text-muted sm:text-lg">
              Plataforma premium de formação e debate — doutrina, guerra atual e
              experiência operacional ao nível dos melhores eventos internacionais.
            </p>
            <span className="btn-primary inline-flex">Entrar no Workshop 2026</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
