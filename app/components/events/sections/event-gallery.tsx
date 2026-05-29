"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MotionReveal } from "../../motion-reveal";
import type { EventData, EventGalleryItem } from "../../../lib/events/types";

export function EventGallery({ event }: { event: EventData }) {
  const [lightbox, setLightbox] = useState<EventGalleryItem | null>(null);

  return (
    <section id="galeria" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">05 · Galeria</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Memória visual
          </h2>
          <div className="gold-line mb-12 w-24" />
        </MotionReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.gallery.map((item, i) => (
            <MotionReveal key={item.src} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => setLightbox(item)}
                className="group relative aspect-[4/3] w-full overflow-hidden border border-gold/15 bg-surface"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/20" />
              </button>
            </MotionReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-6 top-6 font-mono text-xs text-gold"
              onClick={() => setLightbox(null)}
            >
              FECHAR
            </button>
            <motion.div
              className="relative max-h-[85vh] max-w-5xl"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.alt}
                width={1200}
                height={900}
                className="max-h-[85vh] w-auto object-contain"
              />
              <p className="mt-4 text-center text-sm text-muted">{lightbox.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
