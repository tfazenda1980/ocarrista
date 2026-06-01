import { TacticalBackground } from "./components/tactical-background";
import { SiteHeader } from "./components/site-header";
import { EntrySectionLoader } from "./components/entry-section-loader";
import { GritoSection } from "./components/grito-section";
import { LemaSection } from "./components/lema-section";
import { VideoPromoSection } from "./components/video-promo-section";
import { EventosSection } from "./components/sections/eventos";
import { HistoriaSection } from "./components/sections/historia";
import { LojaSection } from "./components/sections/loja";
import { AdminAlertBar } from "./components/admin/admin-alert-bar";
import { AdminSection } from "./components/sections/admin-section";
import { ComunidadeSection } from "./components/sections/comunidade";
import { GescoSection } from "./components/sections/gesco";
import { SiteFooter } from "./components/site-footer";
import { canAccessGesco, canAccessLoja, comunidadeView } from "./lib/auth/member-access";
import { listMembersByStatus } from "./lib/members/repository";
import { getSession } from "./lib/auth/session";

export default async function Home() {
  const session = await getSession();
  const isAdmin = session.role === "admin";
  const showLoja = canAccessLoja(session);
  const showGesco = canAccessGesco(session);
  const comunidade = comunidadeView(session);
  const pendingCount = isAdmin ? (await listMembersByStatus("pending")).length : 0;

  return (
    <>
      <TacticalBackground />
      <div className="relative z-10 flex min-h-full flex-col">
        <SiteHeader />
        {isAdmin && <AdminAlertBar pendingCount={pendingCount} />}
        <main>
          <EntrySectionLoader />
          <GritoSection />
          <LemaSection />
          <VideoPromoSection />
          <EventosSection />
          <HistoriaSection />
          {showLoja && <LojaSection memberName={session.name} />}
          <ComunidadeSection
            view={comunidade}
            memberName={session.name}
            showGesco={showGesco}
          />
          {isAdmin && <AdminSection pendingCount={pendingCount} />}
          {showGesco && <GescoSection />}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
