import type { Metadata } from "next";
import { Barlow, Oswald, Geist_Mono } from "next/font/google";
import { HashScrollManager } from "./components/hash-scroll-manager";
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

export const metadata: Metadata = {
  title: "O Carrista",
  description:
    "O Carrista — De Santa Margarida. Comunidade Ex-RC4: eventos anuais, história do Regimento de Cavalaria 4 e Loja do Carrista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${oswald.variable} ${barlow.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <HashScrollManager />
        {children}
      </body>
    </html>
  );
}
