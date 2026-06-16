"use client";

import { TacticalBackground } from "../tactical-background";
import { EditionYearBar } from "./edition-year-bar";
import { EventSiteHeader } from "./event-site-header";
import type { EventData } from "../../lib/events/types";
import { EventHero } from "./sections/event-hero";
import { EventAbout } from "./sections/event-about";
import { EventAxesSection } from "./sections/event-axes-section";
import { EventSpotlight } from "./sections/event-spotlight";
import { EventProgram } from "./sections/event-program";
import { EventSpeakers } from "./sections/event-speakers";
import { EventPersonProfileHost } from "./sections/event-person-profile-host";
import { EventGallery } from "./sections/event-gallery";
import { EventRegistration } from "./sections/event-registration";
import { EventFooter } from "./sections/event-footer";
import { EditionPlaceholder } from "./sections/edition-placeholder";
import { EventArchiveEdition } from "./sections/event-archive-edition";
import { StickyBackLink } from "../sticky-back-link";

type EventPageProps = {
  event: EventData;
  seriesYears?: string[];
  activeYear?: string;
  seriesTitle?: string;
};

export function EventPageView({
  event,
  seriesYears,
  activeYear,
  seriesTitle,
}: EventPageProps) {
  const published = event.published !== false;
  const showEditionBar = seriesYears && activeYear;
  const useAxesLayout =
    event.themes.length >= 2 && event.panels.some((p) => p.axisId);

  return (
    <>
      <TacticalBackground />
      <div className="event-platform relative z-10 flex min-h-full flex-col">
        <EventSiteHeader
          edition={seriesTitle ?? event.edition}
          subtitle={showEditionBar ? event.edition : undefined}
        />
        {showEditionBar && (
          <EditionYearBar years={seriesYears} activeYear={activeYear} />
        )}
        <StickyBackLink
          href="/#eventos"
          label="Agenda O Carrista"
          variant={showEditionBar ? "workshop" : "default"}
        />
        <main>
          {!published && event.archivePdf ? (
            <EventArchiveEdition event={event} />
          ) : (
            <EventPersonProfileHost event={event}>
              <EventHero event={event} showRegistrationCta={published} />
              {published ? (
                <>
                  <EventAbout event={event} />
                  {useAxesLayout ? (
                    <EventAxesSection event={event} />
                  ) : (
                    <>
                      <EventProgram event={event} />
                      <EventSpotlight event={event} />
                    </>
                  )}
                  <EventSpeakers event={event} hideModerators={useAxesLayout} />
                  <EventGallery event={event} />
                  <EventRegistration event={event} />
                </>
              ) : (
                <EditionPlaceholder event={event} />
              )}
            </EventPersonProfileHost>
          )}
        </main>
        {published && <EventFooter event={event} />}
      </div>
    </>
  );
}
