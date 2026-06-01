"use client";

import type { EventData } from "@/app/lib/events/types";
import { EventArchivePdf } from "./event-archive-pdf";

type EventArchiveEditionProps = {
  event: EventData;
};

/** Edição arquivo: cabeçalho mínimo + PDF a largura total (sem hero nem rodapé longo). */
export function EventArchiveEdition({ event }: EventArchiveEditionProps) {
  const pdf = event.archivePdf;
  if (!pdf) return null;

  const downloadHref = pdf.href.split("?")[0].split("#")[0];

  return (
    <>
      <div className="event-archive-intro border-b border-gold/15 bg-background/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-gold uppercase">
              {event.edition}
            </p>
            <h1 className="display-heading mt-1 text-xl font-semibold sm:text-2xl">
              {pdf.label}
            </h1>
          </div>
          <a
            href={downloadHref}
            download
            className="btn-primary shrink-0 px-4 py-2.5 text-xs sm:text-sm"
          >
            Descarregar PDF
          </a>
        </div>
      </div>
      <EventArchivePdf
        label={pdf.label}
        href={pdf.href}
        hint={pdf.hint ?? "Deslize para ver cada página"}
        showDownloadFooter={false}
      />
    </>
  );
}
