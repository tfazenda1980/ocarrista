import type { CncDiscipline, CncPdfResource } from "../events/cnc-types";

export type CncDisciplineKind = "resources" | "gallery";

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
  label: string,
  asset?: CncAsset | null,
  fallback?: CncPdfResource | null,
): CncPdfResource {
  if (asset) {
    return {
      label: asset.label || fallback?.label || label,
      href: asset.url,
      mime: asset.mime,
      filename: asset.filename,
    };
  }
  return {
    label: fallback?.label || label,
    href: fallback?.href ?? null,
    mime: fallback?.mime ?? null,
    filename: fallback?.filename ?? null,
  };
}

export function resourceSlotsForDiscipline(discipline: CncDiscipline): string[] {
  if (discipline.galleryPdf) {
    return [disciplineSlot(discipline.id, "gallery")];
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
