"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UnitCrest } from "../../unit-crest";
import { LanguageSwitcher } from "../../i18n/language-switcher";
import { useT } from "../../i18n/locale-provider";

export function ChallengerSiteHeader({ edition }: { edition: string }) {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorLinks = [
    { href: "#finalidade", label: t("challenger.navPurpose") },
    { href: "#provas", label: t("challenger.navProvas") },
    { href: "#guarnicoes", label: t("challenger.navCrews") },
    { href: "#classificacao", label: t("challenger.navClass") },
    { href: "#contactos", label: t("challenger.navContacts") },
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
          <UnitCrest size="nav" />
          <div className="flex flex-col">
            <span className="font-display text-xs font-semibold tracking-[0.18em] text-foreground uppercase sm:text-sm">
              Challenger
            </span>
            <span className="text-[0.55rem] tracking-[0.2em] text-gold-dim uppercase">
              {edition}
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label={t("challenger.navAria")}>
          {anchorLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-[0.65rem] tracking-[0.14em] text-gold/80 uppercase hover:text-gold"
            >
              {link.label}
            </a>
          ))}
          <LanguageSwitcher />
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="font-display text-xs tracking-[0.14em] text-gold uppercase"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {t("nav.menu")}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-gold/15 bg-background/95 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-sm tracking-[0.12em] text-gold uppercase"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
