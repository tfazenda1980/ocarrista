import {
  getUpcomingWorkshopPreview,
  getWorkshopTeaserForHomepage,
} from "../lib/events/workshop-teaser";
import { EntrySection } from "./entry-section";

export function EntrySectionLoader() {
  const workshopTeaser = getWorkshopTeaserForHomepage();
  const workshopPreview = workshopTeaser
    ? null
    : getUpcomingWorkshopPreview();

  return (
    <EntrySection
      workshopTeaser={workshopTeaser}
      workshopPreview={workshopPreview}
    />
  );
}
