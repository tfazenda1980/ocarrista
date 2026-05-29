"use client";

import { TacticalBackground } from "../tactical-background";
import { EventSiteHeader } from "./event-site-header";
import type { EventData } from "../../lib/events/types";
import { EventHero } from "./sections/event-hero";
import { EventAbout } from "./sections/event-about";
import { EventThemes } from "./sections/event-themes";
import { EventProgram } from "./sections/event-program";
import { EventSpeakers } from "./sections/event-speakers";
import { EventGallery } from "./sections/event-gallery";
import { EventRegistration } from "./sections/event-registration";
import { EventFooter } from "./sections/event-footer";

type EventPageProps = {
  event: EventData;
};

export function EventPageView({ event }: EventPageProps) {
  return (
    <>
      <TacticalBackground />
      <div className="event-platform relative z-10 flex min-h-full flex-col">
        <EventSiteHeader edition={event.edition} />
        <main>
          <EventHero event={event} />
          <EventAbout event={event} />
          <EventThemes event={event} />
          <EventProgram event={event} />
          <EventSpeakers event={event} />
          <EventGallery event={event} />
          <EventRegistration event={event} />
        </main>
        <EventFooter event={event} />
      </div>
    </>
  );
}
