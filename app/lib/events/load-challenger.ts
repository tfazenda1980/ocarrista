import type { ChallengerEventData, ChallengerSeries } from "./challenger-types";
import series from "../../../content/events/challenger/series.json";
import edition2026 from "../../../content/events/challenger/2026.json";

const editions: Record<string, ChallengerEventData> = {
  "2026": edition2026 as ChallengerEventData,
};

export function getChallengerSeries(): ChallengerSeries {
  return series as ChallengerSeries;
}

export function getChallengerEdition(year: string): ChallengerEventData | null {
  return editions[year] ?? null;
}

export function getChallengerYearsForStaticParams(): { year: string }[] {
  return (series as ChallengerSeries).years.map((year) => ({ year }));
}

export function isChallengerYearValid(year: string): boolean {
  return (series as ChallengerSeries).years.includes(year);
}
