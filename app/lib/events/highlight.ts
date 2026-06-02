import { getCncEdition, getCncSeries } from "./load-cnc";
import { getWorkshopEdition, getWorkshopSeries } from "./load-workshop";

/** Janela de destaque na entrada: três semanas antes do evento (igual ao teaser). */
export const EVENT_HIGHLIGHT_WINDOW_MS = 21 * 24 * 60 * 60 * 1000;

export type EventHighlightCandidate = {
  /** Chave única para notificações, ex. workshop:2026 */
  key: string;
  title: string;
  edition: string;
  dateDisplay: string;
  location: string;
  href: string;
  daysRemaining: number;
};

function inHighlightWindow(eventIsoDate: string, now = Date.now()): number | null {
  const eventTime = new Date(eventIsoDate).getTime();
  const diff = eventTime - now;
  if (diff > 0 && diff <= EVENT_HIGHLIGHT_WINDOW_MS) {
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }
  return null;
}

/** Eventos publicados que entraram na janela de destaque (≤3 semanas e no futuro). */
export function getEventsInHighlightWindow(now = Date.now()): EventHighlightCandidate[] {
  const out: EventHighlightCandidate[] = [];

  const workshopSeries = getWorkshopSeries();
  for (const year of workshopSeries.years) {
    const edition = getWorkshopEdition(year);
    if (!edition || edition.published === false) continue;
    const days = inHighlightWindow(edition.date, now);
    if (days === null) continue;
    out.push({
      key: `workshop:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/workshop/${year}`,
      daysRemaining: days,
    });
  }

  const cncSeries = getCncSeries();
  for (const year of cncSeries.years) {
    const edition = getCncEdition(year);
    if (!edition || edition.published === false) continue;
    const days = inHighlightWindow(edition.date, now);
    if (days === null) continue;
    out.push({
      key: `cnc:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/cnc/${year}`,
      daysRemaining: days,
    });
  }

  return out;
}
