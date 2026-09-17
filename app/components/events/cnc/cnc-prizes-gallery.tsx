"use client";

import type { CncPdfResource } from "@/app/lib/events/cnc-types";
import { CncDocumentPreview } from "./cnc-document-preview";
import { getSketchKind } from "@/app/lib/challenger/sketch";

type CncPrizesGalleryProps = {
  galleryPdf: CncPdfResource;
};

export function CncPrizesGallery({ galleryPdf }: CncPrizesGalleryProps) {
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

  const kind = getSketchKind(galleryPdf.mime ?? null, galleryPdf.href);
  const hint =
    kind === "image"
      ? "Galeria de prémios"
      : "Deslize para ver cada prova e os respetivos prémios";

  return <CncDocumentPreview resource={galleryPdf} hint={hint} />;
}
