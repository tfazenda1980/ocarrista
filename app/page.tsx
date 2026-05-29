import { TacticalBackground } from "./components/tactical-background";
import { SiteHeader } from "./components/site-header";
import { EntrySection } from "./components/entry-section";
import { GritoSection } from "./components/grito-section";
import { VideoPromoSection } from "./components/video-promo-section";
import { EventosSection } from "./components/sections/eventos";
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
          <VideoPromoSection />
          <EventosSection />
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
