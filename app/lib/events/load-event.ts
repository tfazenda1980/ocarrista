import type { EventData } from "./types";
import workshop2026 from "../../../content/events/workshop-2026.json";

const registry: Record<string, EventData> = {
  "workshop-2026": workshop2026 as EventData,
};

export function getEventBySlug(slug: string): EventData | null {
  return registry[slug] ?? null;
}

export function getAllEventSlugs(): string[] {
  return Object.keys(registry);
}

export function getEventSlugsForStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}
