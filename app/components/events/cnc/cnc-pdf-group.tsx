"use client";

import { useEffect, useRef, useState } from "react";
import type { CncDisciplineResources, CncPdfResource } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";
import { CncDocumentPreview } from "./cnc-document-preview";

type ResourceKey = keyof CncDisciplineResources;

const HINTS: Record<ResourceKey, string> = {
  ordens: "Ordens de entrada — deslize para folhear o documento",
  croquis: "Croqui do percurso — deslize para folhear o documento",
  resultados: "Resultados — deslize para folhear o documento",
};

export function CncPdfGroup({ resources }: { resources: CncDisciplineResources }) {
  const [openKey, setOpenKey] = useState<ResourceKey | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const open = openKey ? resources[openKey] : null;

  useEffect(() => {
    if (!open?.href) return;
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open?.href, openKey]);

  const toggle = (key: ResourceKey) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CncPdfSlot
          resource={resources.ordens}
          selected={openKey === "ordens"}
          onOpen={resources.ordens.href ? () => toggle("ordens") : undefined}
        />
        <CncPdfSlot
          resource={resources.croquis}
          selected={openKey === "croquis"}
          onOpen={resources.croquis.href ? () => toggle("croquis") : undefined}
        />
        <CncPdfSlot
          resource={resources.resultados}
          selected={openKey === "resultados"}
          onOpen={resources.resultados.href ? () => toggle("resultados") : undefined}
        />
      </div>
      {open?.href && openKey ? (
        <div ref={previewRef}>
          <CncDocumentPreview resource={open} hint={HINTS[openKey]} />
        </div>
      ) : null}
    </div>
  );
}

export function CncOpenableDocument({
  resource,
  hint,
}: {
  resource: CncPdfResource;
  hint: string;
}) {
  const [open, setOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !resource.href) return;
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, resource.href]);

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <CncPdfSlot
          resource={resource}
          selected={open}
          onOpen={resource.href ? () => setOpen((value) => !value) : undefined}
        />
      </div>
      {open && resource.href ? (
        <div ref={previewRef}>
          <CncDocumentPreview resource={resource} hint={hint} />
        </div>
      ) : null}
    </div>
  );
}
