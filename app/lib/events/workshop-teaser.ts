import type { EntryTeaserInfo, EntryUpcomingPreview } from "./entry-teaser";
import {
  getEntryTeasersForHomepage,
  getUpcomingEventPreview,
} from "./entry-teaser";

export type { EntryTeaserInfo, EntryUpcomingPreview };
export type WorkshopTeaserInfo = EntryTeaserInfo;
export type WorkshopUpcomingPreview = EntryUpcomingPreview;

export { getEntryTeasersForHomepage, getUpcomingEventPreview };

/** @deprecated Use getEntryTeasersForHomepage */
export function getWorkshopTeaserForHomepage() {
  const teasers = getEntryTeasersForHomepage();
  return teasers[0] ?? null;
}

/** @deprecated Use getUpcomingEventPreview */
export function getUpcomingWorkshopPreview() {
  return getUpcomingEventPreview();
}
