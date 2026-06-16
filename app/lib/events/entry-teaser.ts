import {
  EVENT_HIGHLIGHT_WINDOW_MS,
  getEventsInHighlightWindow,
  type EventHighlightCandidate,
} from "./highlight";
import { getCncEdition, getCncSeries } from "./load-cnc";
import { getChallengerEdition, getChallengerSeries } from "./load-challenger";
import { getWorkshopEdition, getWorkshopSeries } from "./load-workshop";

export type EntryTeaserInfo = EventHighlightCandidate;

export type EntryUpcomingPreview = {
  key: string;
  title: string;
  edition: string;
  dateDisplay: string;
  location: string;
  href: string;
  daysUntilEvent: number;
  daysUntilTeaser: number;
};

/** Destaques na homepage (≤3 semanas, todos os eventos publicados). */
export function getEntryTeasersForHomepage(): EntryTeaserInfo[] {
  return getEventsInHighlightWindow();
}

type FutureEdition = {
  key: string;
  title: string;
  edition: string;
  dateDisplay: string;
  location: string;
  href: string;
  eventTime: number;
};

function collectFutureEditions(now: number): FutureEdition[] {
  const out: FutureEdition[] = [];

  for (const year of getWorkshopSeries().years) {
    const edition = getWorkshopEdition(year);
    if (!edition || edition.published === false) continue;
    const eventTime = new Date(edition.date).getTime();
    if (eventTime <= now) continue;
    out.push({
      key: `workshop:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/workshop/${year}`,
      eventTime,
    });
  }

  for (const year of getCncSeries().years) {
    const edition = getCncEdition(year);
    if (!edition || edition.published === false) continue;
    const eventTime = new Date(edition.date).getTime();
    if (eventTime <= now) continue;
    out.push({
      key: `cnc:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/cnc/${year}`,
      eventTime,
    });
  }

  for (const year of getChallengerSeries().years) {
    const edition = getChallengerEdition(year);
    if (!edition || edition.published === false) continue;
    const eventTime = new Date(edition.date).getTime();
    if (eventTime <= now) continue;
    out.push({
      key: `challenger:${year}`,
      title: edition.title,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      href: `/eventos/challenger/${year}`,
      eventTime,
    });
  }

  return out.sort((a, b) => a.eventTime - b.eventTime);
}

/** Próximo evento quando ainda não há destaque activo na entrada. */
export function getUpcomingEventPreview(): EntryUpcomingPreview | null {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const next = collectFutureEditions(now)[0];
  if (!next) return null;

  const diff = next.eventTime - now;
  const daysUntilEvent = Math.ceil(diff / dayMs);
  if (diff <= EVENT_HIGHLIGHT_WINDOW_MS) return null;

  return {
    key: next.key,
    title: next.title,
    edition: next.edition,
    dateDisplay: next.dateDisplay,
    location: next.location,
    href: next.href,
    daysUntilEvent,
    daysUntilTeaser: Math.max(0, daysUntilEvent - 21),
  };
}
