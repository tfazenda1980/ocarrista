import type { CncEventData, CncSeries } from "./cnc-types";
import series from "../../../content/events/cnc/series.json";
import edition2026 from "../../../content/events/cnc/2026.json";

const editions: Record<string, CncEventData> = {
  "2026": edition2026 as CncEventData,
};

export const cncSeries = series as CncSeries;

export function getCncSeries(): CncSeries {
  return cncSeries;
}

export function getCncEdition(year: string): CncEventData | null {
  return editions[year] ?? null;
}

export function getCncYearsForStaticParams() {
  return cncSeries.years.map((year) => ({ year }));
}

export function isCncYearValid(year: string): boolean {
  return cncSeries.years.includes(year);
}
