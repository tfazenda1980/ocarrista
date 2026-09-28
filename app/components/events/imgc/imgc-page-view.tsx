"use client";

import { TacticalBackground } from "../../tactical-background";
import { EditionYearBar } from "../edition-year-bar";
import { StickyBackLink } from "../../sticky-back-link";
import type { ImgcEventData } from "@/app/lib/events/imgc-types";
import { ImgcSiteHeader } from "./imgc-site-header";
import { ImgcHero } from "./imgc-hero";
import { ImgcAbout } from "./imgc-about";
import { ImgcDelegationsMap } from "./imgc-delegations-map";
import { ImgcProgramme } from "./imgc-programme";
import { ImgcBarracks } from "./imgc-barracks";
import { ImgcDiscoverTomar } from "./imgc-discover-tomar";
import { ImgcPractical } from "./imgc-practical";
import { ImgcPhotoGallery } from "./imgc-photo-gallery";
import { ImgcContacts } from "./imgc-contacts";
import { ImgcSuggestions } from "./imgc-suggestions";
import { ImgcFooter } from "./imgc-footer";
import { useT } from "../../i18n/locale-provider";

type ImgcPageViewProps = {
  event: ImgcEventData;
  seriesYears?: string[];
  activeYear?: string;
  seriesTitle?: string;
};

export function ImgcPageView({
  event,
  seriesYears,
  activeYear,
}: ImgcPageViewProps) {
  const { t } = useT();
  const showEditionBar = seriesYears && activeYear && seriesYears.length > 1;

  return (
    <>
      <TacticalBackground />
      <div className="event-platform relative z-10 flex min-h-full flex-col">
        <ImgcSiteHeader edition={event.edition} />
        {showEditionBar && (
          <EditionYearBar
            years={seriesYears}
            activeYear={activeYear}
            basePath="/eventos/imgc"
          />
        )}
        <StickyBackLink
          href="/#eventos"
          label={t("common.agenda")}
          variant={showEditionBar ? "workshop" : "default"}
        />
        <main>
          <ImgcHero event={event} />
          <ImgcAbout event={event} />
          <ImgcDelegationsMap event={event} />
          <ImgcProgramme event={event} />
          <ImgcBarracks event={event} />
          <ImgcDiscoverTomar event={event} />
          <ImgcPractical event={event} />
          <ImgcPhotoGallery event={event} />
          <ImgcContacts event={event} />
          <ImgcSuggestions event={event} />
        </main>
        <ImgcFooter event={event} />
      </div>
    </>
  );
}
