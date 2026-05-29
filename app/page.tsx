import { TacticalBackground } from "./components/tactical-background";
import { SiteHeader } from "./components/site-header";
import { EntrySection } from "./components/entry-section";
import { GritoSection } from "./components/grito-section";
import { LemaSection } from "./components/lema-section";
import { VideoPromoSection } from "./components/video-promo-section";
import { EventosSection } from "./components/sections/eventos";
import { WorkshopTeaserSection } from "./components/sections/workshop-teaser";
import { HistoriaSection } from "./components/sections/historia";
import { LojaSection } from "./components/sections/loja";
import { ComunidadeSection } from "./components/sections/comunidade";
import { GescoSection } from "./components/sections/gesco";
import { SiteFooter } from "./components/site-footer";

export default function Home() {
  return (
    <>
      <TacticalBackground />
      <div className="relative z-10 flex min-h-full flex-col">
        <SiteHeader />
        <main>
          <EntrySection />
          <GritoSection />
          <LemaSection />
          <VideoPromoSection />
          <EventosSection />
          <WorkshopTeaserSection />
          <HistoriaSection />
          <LojaSection />
          <ComunidadeSection />
          <GescoSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
