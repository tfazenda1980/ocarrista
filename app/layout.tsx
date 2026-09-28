import type { Metadata } from "next";
import { Barlow, Oswald, Geist_Mono } from "next/font/google";
import { HashScrollManager } from "./components/hash-scroll-manager";
import { SessionInactivityGuard } from "./components/session-inactivity-guard";
import { LocaleProvider } from "./components/i18n/locale-provider";
import { getTranslator } from "./lib/i18n/get-locale";
import { HTML_LANG } from "./lib/i18n/config";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getTranslator();

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${oswald.variable} ${barlow.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider locale={locale} messages={messages}>
          <HashScrollManager />
          <SessionInactivityGuard />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
