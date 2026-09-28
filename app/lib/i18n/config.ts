export const LOCALES = ["pt", "en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

export const LOCALE_COOKIE = "ocarrista_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  fr: "FR",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
};

export const HTML_LANG: Record<Locale, string> = {
  pt: "pt",
  en: "en",
  fr: "fr",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
