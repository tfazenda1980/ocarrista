"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { ChallengerProva } from "@/app/lib/challenger/types";
import { getSketchKind, sketchLabel } from "@/app/lib/challenger/sketch";
import { PdfHorizontalViewer } from "../../pdf-horizontal-viewer";

export function ChallengerProvaSketch({ prova }: { prova: ChallengerProva }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.06, once: true });

  if (!prova.sketch_url) return null;

  const kind = getSketchKind(prova.sketch_mime, prova.sketch_url);
  const label = sketchLabel(prova.sketch_mime, prova.sketch_label);

  if (kind === "pdf") {
    return (
      <div ref={ref} className="-mx-4 mt-8 sm:-mx-6">
        <PdfHorizontalViewer
          pdfUrl={prova.sketch_url}
          active={inView}
          label={prova.title}
          hint="Deslize ou use as setas para folhear o croqui"
          showDownloadFooter
        />
      </div>
    );
  }

  if (kind === "image") {
    return (
      <figure ref={ref} className="mt-8">
        <div className="overflow-hidden border border-gold/20 bg-surface/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={prova.sketch_url}
            alt={label}
            className="mx-auto max-h-[min(85vh,900px)] w-full object-contain"
            loading="lazy"
          />
        </div>
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>{sketchLabel(prova.sketch_mime, prova.sketch_label, prova.sketch_url)}</span>
          <a
            href={prova.sketch_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="font-display tracking-[0.1em] text-gold uppercase hover:text-gold-bright"
          >
            Descarregar imagem →
          </a>
        </figcaption>
      </figure>
    );
  }

  return (
    <a
      href={prova.sketch_url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex border border-gold/30 px-4 py-2 font-display text-[0.65rem] tracking-[0.12em] text-gold uppercase transition-colors hover:border-gold/50 hover:bg-gold/5"
    >
      {label} →
    </a>
  );
}
