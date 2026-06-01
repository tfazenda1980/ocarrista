"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { PdfHorizontalViewer } from "../../pdf-horizontal-viewer";

type EventArchivePdfProps = {
  label: string;
  href: string;
  hint?: string;
};

export function EventArchivePdf({ label, href, hint }: EventArchivePdfProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.08, once: true });

  return (
    <section id="arquivo-pdf" className="scroll-mt-24 py-8 sm:py-12" ref={ref}>
      <PdfHorizontalViewer
        pdfUrl={href}
        active={inView}
        label={label}
        hint={hint ?? "Deslize para o lado para ver cada página"}
      />
    </section>
  );
}
