import {
  getEntryTeasersForHomepage,
  getUpcomingEventPreview,
} from "../lib/events/entry-teaser";
import { EntrySection } from "./entry-section";

export function EntrySectionLoader() {
  const teasers = getEntryTeasersForHomepage();
  const preview = teasers.length > 0 ? null : getUpcomingEventPreview();

  return <EntrySection teasers={teasers} preview={preview} />;
}
