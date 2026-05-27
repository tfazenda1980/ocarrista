"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type TacticalCardProps = {
  title: string;
  description: string;
  meta?: string;
  icon?: ReactNode;
};

export function TacticalCard({ title, description, meta, icon }: TacticalCardProps) {
  return (
    <motion.article
      className="card-tactical corner-brackets group relative p-6 sm:p-8"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.005 }}
    >
      {icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center border border-gold/30 text-gold transition-colors group-hover:border-gold/60 group-hover:bg-gold/5">
          {icon}
        </div>
      )}
      {meta && (
        <p className="font-mono mb-2 text-[0.65rem] tracking-wider text-gold-dim uppercase">
          {meta}
        </p>
      )}
      <h3 className="font-display mb-3 text-lg font-semibold tracking-wide text-foreground uppercase sm:text-xl">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted sm:text-base">{description}</p>
    </motion.article>
  );
}
