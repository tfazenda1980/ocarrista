"use client";

import Link from "next/link";
import { useAuthSession } from "../hooks/use-auth-session";
import { useT } from "./i18n/locale-provider";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { session } = useAuthSession();
  const { t } = useT();
  const showLoja = session.authenticated && session.role === "user";
  const showGesco = session.authenticated && session.gescoAccess === true;

  const links = [
    { href: "#eventos", label: t("nav.events") },
    { href: "#historia", label: t("nav.history") },
    ...(showLoja ? [{ href: "#loja", label: t("nav.shop") }] : []),
    { href: "#comunidade", label: t("nav.community") },
    ...(showGesco ? [{ href: "#gesco", label: t("nav.gesco") }] : []),
  ];

  return (
    <footer className="relative border-t border-gold/15 bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.2em] uppercase">
              {t("brand.name")}
            </p>
            <p className="mt-1 font-display text-xs tracking-[0.2em] text-gold uppercase">
              {t("brand.tagline")}
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {t("footer.blurb", { shop: showLoja ? t("footer.shopSuffix") : "" })}
            </p>
            {showGesco && (
              <p className="mt-2 max-w-sm text-xs text-muted/80">{t("footer.gesco")}</p>
            )}
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            {session.authenticated ? (
              session.role === "admin" ? (
                <a
                  href="#admin"
                  className="font-display text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-gold"
                >
                  {t("nav.admin")}
                </a>
              ) : null
            ) : (
              <Link
                href="/entrar"
                className="font-display text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-gold"
              >
                {t("nav.login")}
              </Link>
            )}
          </nav>
        </div>

        <div className="gold-line my-8" />

        <div className="flex flex-col gap-2 text-[0.7rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year })}</p>
          <p className="font-mono tracking-wider uppercase">{t("brand.republic")}</p>
        </div>
      </div>
    </footer>
  );
}
