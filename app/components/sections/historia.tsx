"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SectionShell } from "../section-shell";
import { UnitCrest } from "../unit-crest";
import { PdfHorizontalViewer } from "../pdf-horizontal-viewer";
import { HISTORIA_SLIDESHOW_PDF } from "../../lib/site-assets";
import {
  DEFAULT_MARCOS,
  loadMarcosFromJson,
  type HistoriaMarco,
} from "../../lib/extract-pdf-marcos";

function Timeline({ marcos }: { marcos: HistoriaMarco[] }) {
  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent sm:left-1/2 sm:-translate-x-px" />

      <ol className="space-y-10 sm:space-y-14">
        {marcos.map((item, i) => (
          <li
            key={`${item.year}-${i}`}
            className={`relative flex flex-col gap-4 sm:w-[calc(50%-2rem)] ${
              i % 2 === 0
                ? "sm:mr-auto sm:pr-8 sm:text-right"
                : "sm:ml-auto sm:pl-8 sm:text-left"
            }`}
          >
            <span
              className={`absolute top-1 h-3 w-3 border border-gold bg-background ${
                i % 2 === 0
                  ? "left-4 sm:left-auto sm:right-0 sm:translate-x-1/2"
                  : "left-4 sm:left-1/2 sm:-translate-x-1/2"
              }`}
            />
            <div className="pl-10 sm:pl-0">
              <span className="font-display text-2xl font-bold text-gold">
                {item.year}
              </span>
              <h3 className="font-display mt-1 text-lg font-semibold tracking-wide uppercase">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {item.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HistoriaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.12, once: true });

  const [marcos, setMarcos] = useState<HistoriaMarco[]>(DEFAULT_MARCOS);

  useEffect(() => {
    loadMarcosFromJson().then((fromJson) => {
      if (fromJson) setMarcos(fromJson);
    });
  }, []);

  return (
    <div ref={sectionRef}>
      <SectionShell
        id="historia"
        label="Secção 02 · História"
        title="Legado do RC4"
        description="A história do Regimento de Cavalaria 4 e de Santa Margarida — preservada para quem serviu, para as famílias e para as gerações futuras."
        alt
      >
        <div className="historia-crest-wrap mb-10 flex justify-center">
          <UnitCrest size="lg" asset="brasao" variant="bare" />
        </div>
      </SectionShell>

      <PdfHorizontalViewer pdfUrl={HISTORIA_SLIDESHOW_PDF} active={inView} />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Timeline marcos={marcos} />
      </div>
    </div>
  );
}
