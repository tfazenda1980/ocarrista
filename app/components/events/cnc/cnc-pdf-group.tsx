import type { CncDisciplineResources } from "@/app/lib/events/cnc-types";
import { CncPdfSlot } from "./cnc-pdf-slot";
import { CncDocumentPreview } from "./cnc-document-preview";

type CncPdfGroupProps = {
  resources: CncDisciplineResources;
};

const PREVIEWS: { key: keyof CncDisciplineResources; hint: string }[] = [
  { key: "ordens", hint: "Ordens de entrada — deslize para folhear o documento" },
  { key: "croquis", hint: "Croqui do percurso — deslize ou descarregue o ficheiro" },
  { key: "resultados", hint: "Resultados — deslize para folhear o documento" },
];

export function CncPdfGroup({ resources }: CncPdfGroupProps) {
  const published = PREVIEWS.flatMap(({ key, hint }) => {
    const resource = resources[key];
    return resource.href ? [{ key, resource, hint }] : [];
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CncPdfSlot resource={resources.ordens} />
        <CncPdfSlot resource={resources.croquis} />
        <CncPdfSlot resource={resources.resultados} />
      </div>
      {published.map((item) => (
        <CncDocumentPreview
          key={item.key}
          resource={item.resource}
          hint={item.hint}
        />
      ))}
    </div>
  );
}
