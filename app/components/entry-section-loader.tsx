import {
  getEntryTeasersForHomepage,
  getUpcomingEventPreview,
} from "../lib/events/entry-teaser";
import { getRequestLocale } from "../lib/i18n/get-locale";
import { EntrySection } from "./entry-section";

export async function EntrySectionLoader() {
  const locale = await getRequestLocale();
  const teasers = getEntryTeasersForHomepage(locale);
  const preview = teasers.length > 0 ? null : getUpcomingEventPreview(locale);

  return <EntrySection teasers={teasers} preview={preview} />;
}
