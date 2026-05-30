import type { EventData } from "./types";

/** Eventos avulsos (não-Workshop) — registar aqui quando existirem */
const registry: Record<string, EventData> = {};

export function getEventBySlug(slug: string): EventData | null {
  return registry[slug] ?? null;
}

export function getAllEventSlugs(): string[] {
  return Object.keys(registry);
}

export function getEventSlugsForStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}
