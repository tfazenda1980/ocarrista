import type { CncDisciplineResources } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";

type CncPdfGroupProps = {
  resources: CncDisciplineResources;
};

export function CncPdfGroup({ resources }: CncPdfGroupProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <CncPdfSlot resource={resources.ordens} />
      <CncPdfSlot resource={resources.croquis} />
      <CncPdfSlot resource={resources.resultados} />
    </div>
  );
}
