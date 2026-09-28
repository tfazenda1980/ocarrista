"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/app/lib/i18n/config";
import { pt, type Messages } from "@/app/lib/i18n/messages";
import { interpolate, lookupMessage } from "@/app/lib/i18n/t";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: pt,
  t: (path, vars) => interpolate(lookupMessage(pt, path), vars),
});

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = (path: string, vars?: Record<string, string | number>) =>
    interpolate(lookupMessage(messages, path), vars);

  return (
    <LocaleContext.Provider value={{ locale, messages, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useT() {
  return useContext(LocaleContext);
}
