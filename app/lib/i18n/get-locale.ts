import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getMessages, type Messages } from "./messages";
import { interpolate, lookupMessage } from "./t";

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export type Translator = (path: string, vars?: Record<string, string | number>) => string;

export function createTranslator(messages: Messages): Translator {
  return (path, vars) => interpolate(lookupMessage(messages, path), vars);
}

export async function getTranslator(): Promise<{
  locale: Locale;
  messages: Messages;
  t: Translator;
}> {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  return { locale, messages, t: createTranslator(messages) };
}
