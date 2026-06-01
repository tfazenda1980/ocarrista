"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { CncPdfResource } from "@/app/lib/events/cnc-types";
import { PdfHorizontalViewer } from "../../pdf-horizontal-viewer";

type CncPrizesGalleryProps = {
  galleryPdf: CncPdfResource;
};

export function CncPrizesGallery({ galleryPdf }: CncPrizesGalleryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.08, once: true });

  if (!galleryPdf.href) {
    return (
      <div className="video-bleed">
        <div className="border-y border-dashed border-gold/20 bg-surface/50 px-4 py-20 text-center sm:px-6">
          <p className="font-display text-sm tracking-[0.12em] text-gold uppercase">
            {galleryPdf.label}
          </p>
          <p className="mt-3 text-sm text-muted">
            O documento com as fotografias dos prémios por prova será publicado em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="-mx-4 sm:-mx-6">
      <PdfHorizontalViewer
        pdfUrl={galleryPdf.href}
        active={inView}
        label={galleryPdf.label}
        hint="Deslize para ver cada prova e os respetivos prémios"
      />
    </div>
  );
}
