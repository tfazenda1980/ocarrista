import type { CncDiscipline, CncPdfResource } from "../events/cnc-types";
import { overlayLocalized, type LocalizedText } from "../i18n/localized";

export type CncDisciplineKind = "resources" | "gallery" | "grouped" | "resultados";

export type CncAsset = {
  id: string;
  year: string;
  slot: string;
  label: string;
  url: string | null;
  mime: string | null;
  filename: string | null;
};

export function openingNoteSlot(): string {
  return "opening_note";
}

export function generalProgramSlot(): string {
  return "general_program";
}

export function regulationSlot(): string {
  return "regulation";
}

export function gallerySlot(id: string): string {
  return `gallery:${id}`;
}

export function usefulSlot(id: string): string {
  return `useful:${id}`;
}

export function sponsorSlot(id: string): string {
  return `sponsor:${id}`;
}

export function disciplineSlot(
  id: string,
  kind: "ordens" | "croquis" | "resultados" | "gallery",
): string {
  return `discipline:${id}:${kind}`;
}

export function emptyResource(
  label: LocalizedText,
  asset?: CncAsset | null,
  fallback?: CncPdfResource | null,
): CncPdfResource {
  const mergedLabel = overlayLocalized(
    asset?.label,
    fallback?.label ?? label,
    "pt",
  ) as CncPdfResource["label"];
  if (asset) {
    return {
      label: mergedLabel,
      href: asset.url,
      mime: asset.mime,
      filename: asset.filename,
    };
  }
  return {
    label: mergedLabel,
    href: fallback?.href ?? null,
    mime: fallback?.mime ?? null,
    filename: fallback?.filename ?? null,
  };
}

export function resourceSlotsForDiscipline(discipline: CncDiscipline): string[] {
  if (discipline.galleryPdf) {
    return [disciplineSlot(discipline.id, "gallery")];
  }
  if (discipline.sections?.length) {
    return discipline.sections.flatMap((section) => {
      if (section.resultados) return [disciplineSlot(section.id, "resultados")];
      return [
        disciplineSlot(section.id, "ordens"),
        disciplineSlot(section.id, "croquis"),
        disciplineSlot(section.id, "resultados"),
      ];
    });
  }
  return [
    disciplineSlot(discipline.id, "ordens"),
    disciplineSlot(discipline.id, "croquis"),
    disciplineSlot(discipline.id, "resultados"),
  ];
}

export function slugifyId(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || crypto.randomUUID().slice(0, 8);
}
