"use client";

import { TacticalBackground } from "../../tactical-background";
import { EditionYearBar } from "../edition-year-bar";
import { StickyBackLink } from "../../sticky-back-link";
import type { CncEventData } from "@/app/lib/events/cnc-types";
import { CncSiteHeader } from "./cnc-site-header";
import { CncHero } from "./cnc-hero";
import { CncAbout } from "./cnc-about";
import { CncOpeningNote } from "./cnc-opening-note";
import { CncGeneralProgram } from "./cnc-general-program";
import { CncRegulation } from "./cnc-regulation";
import { CncDisciplines } from "./cnc-disciplines";
import { CncPhotoGallery } from "./cnc-photo-gallery";
import { CncUsefulInfo } from "./cnc-useful-info";
import { CncContacts } from "./cnc-contacts";
import { CncTalkToUs } from "./cnc-talk-to-us";
import { CncSponsors } from "./cnc-sponsors";
import { CncFooter } from "./cnc-footer";
import { CncDayNotices } from "./cnc-day-notices";

type CncPageViewProps = {
  event: CncEventData;
  seriesYears?: string[];
  activeYear?: string;
  seriesTitle?: string;
};

export function CncPageView({
  event,
  seriesYears,
  activeYear,
  seriesTitle,
}: CncPageViewProps) {
  const showEditionBar = seriesYears && activeYear && seriesYears.length > 1;
  const activeNotices = (event.notices ?? []).filter((notice) => notice.active);
  const hasNotices = activeNotices.length > 0;

  return (
    <>
      <TacticalBackground />
      <div className="event-platform relative z-10 flex min-h-full flex-col">
        <CncSiteHeader edition={event.edition} />
        {showEditionBar && (
          <EditionYearBar
            years={seriesYears}
            activeYear={activeYear}
            basePath="/eventos/cnc"
          />
        )}
        {hasNotices ? (
          <div className="fixed inset-x-0 top-16 z-[45] sm:top-[4.25rem]">
            <CncDayNotices notices={activeNotices} />
            <StickyBackLink href="/#eventos" label="Agenda O Carrista" variant="stacked" />
          </div>
        ) : (
          <StickyBackLink
            href="/#eventos"
            label="Agenda O Carrista"
            variant={showEditionBar ? "workshop" : "default"}
          />
        )}
        <main>
          <CncHero event={event} />
          <CncAbout event={event} />
          <CncOpeningNote event={event} />
          <CncGeneralProgram event={event} />
          <CncRegulation event={event} />
          <CncDisciplines event={event} />
          <CncPhotoGallery event={event} />
          <CncUsefulInfo event={event} />
          <CncContacts event={event} />
          <CncTalkToUs event={event} />
          <CncSponsors event={event} />
        </main>
        <CncFooter event={event} />
      </div>
    </>
  );
}
