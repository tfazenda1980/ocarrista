import type { CncDisciplineResources } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";
import { CncDocumentPreview } from "./cnc-document-preview";

type CncPdfGroupProps = {
  resources: CncDisciplineResources;
};

export function CncPdfGroup({ resources }: CncPdfGroupProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CncPdfSlot resource={resources.ordens} />
        <CncPdfSlot resource={resources.croquis} />
        <CncPdfSlot resource={resources.resultados} />
      </div>
      {resources.croquis.href ? (
        <CncDocumentPreview
          resource={resources.croquis}
          hint="Croqui do percurso — deslize ou descarregue o ficheiro"
        />
      ) : null}
    </div>
  );
}
