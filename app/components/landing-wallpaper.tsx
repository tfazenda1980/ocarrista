import Image from "next/image";
import { CNC_SRC } from "../lib/site-assets";

/** Wallpaper equestre na homepage (atrás do conteúdo, abaixo do header). */
export function LandingWallpaper() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      <div className="absolute inset-0 flex items-center justify-end">
        <Image
          src={CNC_SRC}
          alt=""
          width={1600}
          height={1200}
          className="castle-entry-bg h-auto min-h-[100vh] w-[min(130vw,1500px)] max-w-none object-contain object-[78%_42%] opacity-[0.14] sm:opacity-[0.18] lg:opacity-[0.22]"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
    </div>
  );
}
