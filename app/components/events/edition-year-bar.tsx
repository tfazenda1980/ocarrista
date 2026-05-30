"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type EditionYearBarProps = {
  years: string[];
  activeYear: string;
  basePath?: string;
};

export function EditionYearBar({
  years,
  activeYear,
  basePath = "/eventos/workshop",
}: EditionYearBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Edições do Workshop"
      className="edition-year-bar sticky top-16 z-40 border-b border-gold/35 bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 sm:gap-2 sm:px-6">
        <span className="mr-2 shrink-0 font-mono text-[0.6rem] tracking-[0.2em] text-gold-dim uppercase sm:mr-4">
          Edição
        </span>
        {years.map((year) => {
          const href = `${basePath}/${year}`;
          const isActive = activeYear === year || pathname === href;
          return (
            <Link
              key={year}
              href={href}
              className={`edition-year-link shrink-0 px-4 py-3 font-display text-sm font-semibold tracking-[0.15em] uppercase transition-colors sm:px-6 sm:text-base ${
                isActive
                  ? "bg-gold text-background"
                  : "text-gold/75 hover:bg-gold/10 hover:text-gold"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {year}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
