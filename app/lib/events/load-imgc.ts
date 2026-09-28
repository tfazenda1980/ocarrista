import type { ImgcEventData, ImgcSeries } from "./imgc-types";
import series from "../../../content/events/imgc/series.json";
import edition2026 from "../../../content/events/imgc/2026.json";

const editions: Record<string, ImgcEventData> = {
  "2026": edition2026 as ImgcEventData,
};

export const imgcSeries = series as ImgcSeries;

export function getImgcSeries(): ImgcSeries {
  return imgcSeries;
}

export function getImgcEdition(year: string): ImgcEventData | null {
  return editions[year] ?? null;
}

export function isImgcYearValid(year: string): boolean {
  return imgcSeries.years.includes(year);
}
