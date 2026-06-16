"use client";

import { TacticalBackground } from "../../tactical-background";
import { EditionYearBar } from "../edition-year-bar";
import { StickyBackLink } from "../../sticky-back-link";
import type { ChallengerLiveData } from "@/app/lib/challenger/types";
import type { ChallengerEventData } from "@/app/lib/events/challenger-types";
import { ChallengerSiteHeader } from "./challenger-site-header";
import { ChallengerHero } from "./challenger-hero";
import { ChallengerPurpose } from "./challenger-purpose";
import { ChallengerProvas } from "./challenger-provas";
import { ChallengerCrews } from "./challenger-crews";
import { ChallengerClassification } from "./challenger-classification";
import { ChallengerContacts } from "./challenger-contacts";

type ChallengerPageViewProps = {
  event: ChallengerEventData;
  live: ChallengerLiveData;
  seriesYears?: string[];
  activeYear?: string;
};

export function ChallengerPageView({
  event,
  live,
  seriesYears,
  activeYear,
}: ChallengerPageViewProps) {
  const showEditionBar = seriesYears && activeYear && seriesYears.length >= 1;

  return (
    <>
      <TacticalBackground />
      <div className="event-platform relative z-10 flex min-h-full flex-col">
        <ChallengerSiteHeader edition={event.edition} />
        {showEditionBar && (
          <EditionYearBar
            years={seriesYears}
            activeYear={activeYear}
            basePath="/eventos/challenger"
            ariaLabel="Edições do Challenger"
          />
        )}
        <StickyBackLink
          href="/#eventos"
          label="Agenda O Carrista"
          variant={showEditionBar ? "workshop" : "default"}
        />
        <main>
          <ChallengerHero event={event} />
          <ChallengerPurpose event={event} />
          <ChallengerProvas provas={live.provas} />
          <ChallengerCrews crews={live.crews} />
          <ChallengerClassification
            provas={live.provas}
            provisional={live.provisional}
            final={live.final}
            showProvisional={live.settings?.provisional_visible ?? true}
            showFinal={live.settings?.final_visible ?? false}
          />
          <ChallengerContacts event={event} />
        </main>
        <footer className="border-t border-gold/10 py-8 text-center">
          <p className="font-mono text-[0.65rem] text-muted">
            {event.edition} · O Carrista
          </p>
        </footer>
      </div>
    </>
  );
}
