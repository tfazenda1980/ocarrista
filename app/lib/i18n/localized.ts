import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export type LocalizedString = {
  pt?: string;
  en?: string;
  fr?: string;
};

export type LocalizedText = string | LocalizedString | null | undefined;

const SKIP_KEYS = new Set([
  "href",
  "src",
  "url",
  "email",
  "date",
  "endDate",
  "year",
  "slug",
  "id",
  "lat",
  "lng",
  "mime",
  "filename",
  "heroImage",
  "cardImage",
  "phone",
  "image",
  "speaker",
  "fullName",
  "time",
  "endTime",
  "duration",
  "qaRoom",
  "axisId",
  "kind",
  "category",
  "published",
  "host",
  "defaultYear",
  "years",
  "key",
]);

export function isLocalizedString(value: unknown): value is LocalizedString {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 0 || !keys.some((key) => isLocale(key))) return false;
  return keys.every(
    (key) => isLocale(key) && (record[key] === undefined || typeof record[key] === "string"),
  );
}

export function toLocalized(value: LocalizedText, fallback = ""): LocalizedString {
  if (isLocalizedString(value)) {
    return {
      pt: value.pt || fallback,
      en: value.en || fallback,
      fr: value.fr || fallback,
    };
  }
  const text = typeof value === "string" ? value : fallback;
  return { pt: text, en: text, fr: text };
}

export function pickLocalized(value: LocalizedText, locale: Locale, fallback = ""): string {
  if (isLocalizedString(value)) {
    return (
      value[locale] ||
      value[DEFAULT_LOCALE] ||
      value.en ||
      value.fr ||
      value.pt ||
      fallback
    );
  }
  if (typeof value === "string") return value;
  return fallback;
}

export function parseLocalized(stored: string | null | undefined): LocalizedString | null {
  if (!stored) return null;
  const trimmed = stored.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isLocalizedString(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeLocalized(value: LocalizedText): string {
  if (typeof value === "string") return value;
  if (isLocalizedString(value)) return JSON.stringify(value);
  return "";
}

/** Merge a DB TEXT column with JSON fallback. Plain legacy strings overlay `primary`. */
export function overlayLocalized(
  stored: string | null | undefined,
  fallback: LocalizedText,
  primary: Locale = DEFAULT_LOCALE,
): LocalizedString {
  const base = toLocalized(fallback);
  const parsed = parseLocalized(stored);
  if (parsed) {
    return {
      pt: parsed.pt || base.pt,
      en: parsed.en || base.en,
      fr: parsed.fr || base.fr,
    };
  }
  if (!stored) return base;
  if (stored === base.pt || stored === base.en || stored === base.fr) return base;
  return { ...base, [primary]: stored };
}

/** Admin single-language edit: keep the other locales from fallback/current. */
export function applyAdminLocale(
  current: LocalizedText,
  fallback: LocalizedText,
  plain: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const merged = overlayLocalized(
    typeof current === "string" ? current : serializeLocalized(current),
    fallback,
    locale,
  );
  merged[locale] = plain;
  return JSON.stringify(merged);
}

export function displayLocalized(value: LocalizedText, locale: Locale = DEFAULT_LOCALE): string {
  return pickLocalized(value, locale);
}

/**
 * Resolve `{pt,en,fr}` (and nested copies) to plain strings for the active locale.
 * File paths, emails, ids and coordinates are left untouched.
 */
export function localizeContent<T>(value: T, locale: Locale): T {
  return localizeUnknown(value, locale) as T;
}

/** Flatten copy for the Portuguese admin CMS. */
export function cmsPlain<T>(value: T): T {
  return localizeContent(value, DEFAULT_LOCALE);
}

function localizeUnknown(value: unknown, locale: Locale): unknown {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value == null) {
    return value;
  }
  if (isLocalizedString(value)) {
    return pickLocalized(value, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeUnknown(item, locale));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(key) || typeof nested === "number" || typeof nested === "boolean") {
        out[key] = nested;
        continue;
      }
      if (key === "name" && typeof nested === "string") {
        out[key] = nested;
        continue;
      }
      out[key] = localizeUnknown(nested, locale);
    }
    return out;
  }
  return value;
}
