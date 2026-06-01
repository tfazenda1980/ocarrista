import Link from "next/link";
import type { ReactNode } from "react";
import { TacticalBackground } from "../tactical-background";
import { UnitCrest } from "../unit-crest";

type AdminPageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminPageShell({ title, description, children }: AdminPageShellProps) {
  return (
    <>
      <TacticalBackground />
      <div className="relative z-10 flex min-h-full flex-col">
        <header className="border-b border-gold/15 bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <UnitCrest size="nav" />
              <div className="flex flex-col">
                <span className="font-display text-xs font-semibold tracking-[0.18em] text-foreground uppercase sm:text-sm">
                  O Carrista
                </span>
                <span className="text-[0.55rem] tracking-[0.2em] text-gold-dim uppercase">
                  Administração
                </span>
              </div>
            </Link>
            <Link
              href="/#admin"
              className="font-display text-[0.65rem] tracking-[0.14em] text-gold uppercase hover:text-gold-bright"
            >
              ← Painel na homepage
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p className="section-label mb-2">Administração</p>
          <h1 className="display-heading mb-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
          {description && <p className="mb-10 max-w-2xl text-muted">{description}</p>}
          {!description && <div className="mb-10" />}
          {children}
        </main>
      </div>
    </>
  );
}
