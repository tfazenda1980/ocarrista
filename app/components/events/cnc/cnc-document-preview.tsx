"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { CncPdfResource } from "@/app/lib/events/cnc-types";
import { getSketchKind } from "@/app/lib/challenger/sketch";
import { PdfHorizontalViewer } from "../../pdf-horizontal-viewer";

export function CncDocumentPreview({
  resource,
  hint,
}: {
  resource: CncPdfResource;
  hint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.08, once: true });

  if (!resource.href) return null;

  const kind = getSketchKind(resource.mime ?? null, resource.href);

  if (kind === "pdf") {
    return (
      <div ref={ref} className="-mx-4 sm:-mx-6">
        <PdfHorizontalViewer
          pdfUrl={resource.href}
          active={inView}
          label={resource.label}
          hint={hint ?? "Deslize para folhear o documento"}
        />
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div ref={ref} className="overflow-hidden border border-gold/20 bg-surface/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resource.href}
          alt={resource.label}
          className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  const isPpt = /\.pptx?$/i.test(resource.href.split("?")[0]);
  if (isPpt) {
    return (
      <iframe
        title={resource.label}
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.href)}`}
        className="h-[28rem] w-full border border-gold/20 bg-surface"
        allowFullScreen
      />
    );
  }

  return null;
}
