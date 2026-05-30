import {
  getWorkshopEdition,
  getWorkshopSeries,
} from "./load-workshop";

const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

export type WorkshopTeaserInfo = {
  year: string;
  edition: string;
  dateDisplay: string;
  location: string;
  slogan: string;
  cardImage: string;
  href: string;
  daysRemaining: number;
};

/**
 * Teaser na homepage só se a edição publicada estiver a menos de 3 semanas
 * e ainda no futuro.
 */
export function getWorkshopTeaserForHomepage(): WorkshopTeaserInfo | null {
  const { years } = getWorkshopSeries();
  const now = Date.now();

  for (const year of years) {
    const edition = getWorkshopEdition(year);
    if (!edition || edition.published === false) continue;

    const eventTime = new Date(edition.date).getTime();
    const diff = eventTime - now;

    if (diff > 0 && diff <= THREE_WEEKS_MS && edition.cardImage) {
      return {
        year,
        edition: edition.edition,
        dateDisplay: edition.dateDisplay,
        location: edition.location,
        slogan: edition.slogan,
        cardImage: edition.cardImage,
        href: `/eventos/workshop/${year}`,
        daysRemaining: Math.ceil(diff / (24 * 60 * 60 * 1000)),
      };
    }
  }

  return null;
}

export type WorkshopUpcomingPreview = {
  year: string;
  edition: string;
  dateDisplay: string;
  location: string;
  daysUntilEvent: number;
  daysUntilTeaser: number;
  workshopHref: string;
};

/** Próxima edição publicada (para placeholder quando o teaser ainda não está ativo). */
export function getUpcomingWorkshopPreview(): WorkshopUpcomingPreview | null {
  const { years } = getWorkshopSeries();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const year of years) {
    const edition = getWorkshopEdition(year);
    if (!edition || edition.published === false) continue;

    const eventTime = new Date(edition.date).getTime();
    const diff = eventTime - now;
    if (diff <= 0) continue;

    const daysUntilEvent = Math.ceil(diff / dayMs);
    const daysUntilTeaser = Math.max(0, daysUntilEvent - 21);

    return {
      year,
      edition: edition.edition,
      dateDisplay: edition.dateDisplay,
      location: edition.location,
      daysUntilEvent,
      daysUntilTeaser,
      workshopHref: `/eventos/workshop/${year}`,
    };
  }

  return null;
}
