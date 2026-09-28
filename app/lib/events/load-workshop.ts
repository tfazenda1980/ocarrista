import type { EventData, WorkshopSeries } from "./types";
import { enrichWorkshopEvent } from "./workshop-people";
import series from "../../../content/events/workshop/series.json";
import edition2026 from "../../../content/events/workshop/2026.json";
import edition2025 from "../../../content/events/workshop/2025.json";
const editions: Record<string, EventData> = {
  "2026": edition2026 as unknown as EventData,
  "2025": edition2025 as unknown as EventData,
};

export const workshopSeries = series as unknown as WorkshopSeries;

export function getWorkshopSeries(): WorkshopSeries {
  return workshopSeries;
}

export function getWorkshopEdition(year: string): EventData | null {
  const edition = editions[year];
  if (!edition) return null;
  return enrichWorkshopEvent(edition);
}

export function getWorkshopYearsForStaticParams() {
  return workshopSeries.years.map((year) => ({ year }));
}

export function isWorkshopYearValid(year: string): boolean {
  return workshopSeries.years.includes(year);
}
