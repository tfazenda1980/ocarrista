"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { motion } from "framer-motion";

type EventCardProps = {
  title: string;
  description: string;
  meta?: string;
  icon?: ReactNode;
  href?: string;
  backgroundImage?: string;
};

export function EventCard({
  title,
  description,
  meta,
  icon,
  href,
  backgroundImage,
}: EventCardProps) {
  const inner = (
    <>
      {backgroundImage && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="event-card-bg object-contain object-right opacity-[0.52] transition-opacity duration-500 group-hover:opacity-[0.68]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/72 to-surface/25" />
        </div>
      )}
      <div className="relative z-10">
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
        {href && (
          <p className="mt-4 font-display text-[0.65rem] tracking-[0.2em] text-gold uppercase opacity-0 transition-opacity group-hover:opacity-100">
            Ver evento →
          </p>
        )}
      </div>
    </>
  );

  const className =
    "card-tactical corner-brackets group relative block overflow-hidden p-6 sm:p-8";

  const motionProps = {
    initial: { opacity: 0, y: 22 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, amount: 0.25 } as const,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    whileHover: { y: -4, scale: 1.005 } as const,
  };

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link href={href} className={className}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article className={className} {...motionProps}>
      {inner}
    </motion.article>
  );
}
