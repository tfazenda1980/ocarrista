"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/app/lib/i18n/config";
import { useT } from "./locale-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const select = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  };

  return (
    <div
      className={`flex items-center gap-1 ${compact ? "" : ""}`}
      role="group"
      aria-label={t("language.choose")}
    >
      {LOCALES.map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            disabled={pending}
            onClick={() => select(item)}
            aria-pressed={active}
            aria-label={LOCALE_LABELS[item]}
            className={`font-display min-w-[1.75rem] px-1 py-0.5 text-[0.65rem] tracking-[0.16em] uppercase transition-colors ${
              active ? "text-gold" : "text-gold/45 hover:text-gold/80"
            }`}
          >
            {LOCALE_LABELS[item]}
          </button>
        );
      })}
    </div>
  );
}
