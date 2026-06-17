import { getCncEdition, getCncSeries } from "./load-cnc";
import { getChallengerEdition, getChallengerSeries } from "./load-challenger";
import { getWorkshopEdition, getWorkshopSeries } from "./load-workshop";

/** Janela de destaque na entrada: três semanas antes até ao fim do evento. */
export const EVENT_HIGHLIGHT_WINDOW_MS = 21 * 24 * 60 * 60 * 1000;

export type EventHighlightCandidate = {
  /** Chave única para notificações, ex. workshop:2026 */
  key: string;
  title: string;
  edition: string;
  dateDisplay: string;
  location: string;
  href: string;
  cardImage: string;
  daysRemaining: number;
  eventTime: number;
};

function endOfDayTime(isoDate: string): number {
  const d = new Date(isoDate);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function inHighlightWindow(
  eventIsoDate: string,
  eventEndIsoDate: string | undefined,
  now = Date.now(),
): number | null {
  const eventTime = new Date(eventIsoDate).getTime();
  const eventEndTime = endOfDayTime(eventEndIsoDate ?? eventIsoDate);

  // Só sai do destaque após terminar o último dia do evento.
  if (now > eventEndTime) return null;

  const diff = eventTime - now;
  if (diff > EVENT_HIGHLIGHT_WINDOW_MS) return null;
  if (diff > 0) return Math.ceil(diff / (24 * 60 * 60 * 1000));
  return 0;
}

/** Eventos publicados na janela de destaque (≤3 semanas ou em curso). */
export function getEventsInHighlightWindow(now = Date.now()): EventHighlightCandidate[] {
  const out: EventHighlightCandidate[] = [];

  const workshopSeries = getWorkshopSeries();
  for (const year of workshopSeries.years) {
    const edition = getWorkshopEdition(year);
    if (!edition || edition.published === false || !edition.cardImage) continue;
    const days = inHighlightWindow(edition.date, edition.endDate, now);
    if (days === null) continue;
    out.push({
      key: `workshop:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/workshop/${year}`,
      cardImage: edition.cardImage,
      daysRemaining: days,
      eventTime: new Date(edition.date).getTime(),
    });
  }

  const cncSeries = getCncSeries();
  for (const year of cncSeries.years) {
    const edition = getCncEdition(year);
    if (!edition || edition.published === false || !edition.cardImage) continue;
    const days = inHighlightWindow(edition.date, edition.endDate, now);
    if (days === null) continue;
    out.push({
      key: `cnc:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/cnc/${year}`,
      cardImage: edition.cardImage,
      daysRemaining: days,
      eventTime: new Date(edition.date).getTime(),
    });
  }

  const challengerSeries = getChallengerSeries();
  for (const year of challengerSeries.years) {
    const edition = getChallengerEdition(year);
    if (!edition || edition.published === false || !edition.cardImage) continue;
    const days = inHighlightWindow(edition.date, edition.endDate, now);
    if (days === null) continue;
    out.push({
      key: `challenger:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/challenger/${year}`,
      cardImage: edition.cardImage,
      daysRemaining: days,
      eventTime: new Date(edition.date).getTime(),
    });
  }

  return out.sort((a, b) => a.eventTime - b.eventTime);
}
