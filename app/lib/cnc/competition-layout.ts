import type { CncDisciplineKind } from "./slots";

export type CncLayoutSection = {
  id: string;
  title: string;
  kind: Extract<CncDisciplineKind, "resources" | "resultados">;
};

const COMBINED_PHASES: CncLayoutSection[] = [
  { id: "ensino", title: "Ensino", kind: "resources" },
  { id: "cross", title: "Cross", kind: "resources" },
  { id: "obstaculos", title: "Obstáculos", kind: "resources" },
  { id: "finais", title: "Resultados finais", kind: "resultados" },
];

const OPEN_PROVAS: CncLayoutSection[] = [
  { id: "050", title: "Prova Open 0,50m", kind: "resources" },
  { id: "090", title: "Prova Open 0,90m", kind: "resources" },
  { id: "100", title: "Prova Open 1,00m", kind: "resources" },
  { id: "110", title: "Prova Open 1,10m", kind: "resources" },
];

export function cncLayoutSectionsForParent(parentId: string): CncLayoutSection[] | null {
  if (parentId === "iniciacao" || parentId === "preliminar") {
    return COMBINED_PHASES.map((phase) => ({
      id: `${parentId}-${phase.id}`,
      title: phase.title,
      kind: phase.kind,
    }));
  }
  if (parentId === "open") {
    return OPEN_PROVAS.map((prova) => ({
      id: `${parentId}-${prova.id}`,
      title: prova.title,
      kind: prova.kind,
    }));
  }
  return null;
}

export function cncProvaSelectOptions(
  disciplines: { id: string; title: string; galleryPdf?: unknown; sections?: { id: string; title: string }[] }[],
): { id: string; label: string }[] {
  const options: { id: string; label: string }[] = [];
  for (const discipline of disciplines) {
    if (discipline.galleryPdf) continue;
    if (discipline.sections?.length) {
      for (const section of discipline.sections) {
        options.push({ id: section.id, label: `${discipline.title} · ${section.title}` });
      }
    } else {
      options.push({ id: discipline.id, label: discipline.title });
    }
  }
  return options;
}
