"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UnitCrest } from "../unit-crest";
import { LanguageSwitcher } from "../i18n/language-switcher";
import { useT } from "../i18n/locale-provider";

type EventSiteHeaderProps = {
  edition: string;
  subtitle?: string;
};

export function EventSiteHeader({ edition, subtitle }: EventSiteHeaderProps) {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorLinks = [
    { href: "#sobre", label: t("workshop.navAbout") },
    { href: "#eixos", label: t("workshop.navAxes") },
    { href: "#oradores", label: t("workshop.navSpeakers") },
    { href: "#inscricao", label: t("workshop.navRegister") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gold/15 bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <UnitCrest size="nav" priority />
          <div className="flex flex-col">
            <span className="font-display text-xs font-semibold tracking-[0.18em] text-foreground uppercase sm:text-sm">
              {t("brand.name")}
            </span>
            <span className="text-[0.55rem] tracking-[0.2em] text-gold-dim uppercase">
              {subtitle ?? edition}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {anchorLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="font-display text-[0.65rem] tracking-[0.16em] text-gold/85 uppercase hover:text-gold-bright"
              whileHover={{ y: -1 }}
            >
              {link.label}
            </motion.a>
          ))}
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-gold/20"
            onClick={() => setOpen(!open)}
            aria-label={t("nav.menu")}
          >
            <span className={`h-px w-5 bg-gold ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-gold ${open ? "opacity-0" : ""}`} />
            <span className={`h-px w-5 bg-gold ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gold/10 bg-background/95 px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {anchorLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-sm tracking-wide text-gold uppercase"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
