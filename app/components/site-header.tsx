"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UnitCrest } from "./unit-crest";
import { useAuthSession } from "../hooks/use-auth-session";

const mainNavLinks = [
  { href: "#eventos", label: "Eventos" },
  { href: "#historia", label: "História" },
  { href: "#comunidade", label: "Comunidade" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session, logout, refresh } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showLoja = session.authenticated && session.role === "user";

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinkClass =
    "font-display text-[0.7rem] tracking-[0.18em] text-gold/85 uppercase transition-colors hover:text-gold-bright";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gold/15 bg-background/65 shadow-[0_10px_40px_rgba(0,0,0,0.55)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between pl-5 pr-4 sm:h-[4.5rem] sm:pl-8 sm:pr-6 md:pl-12 lg:pl-16 xl:pl-24">
        <a href="#" className="group flex items-center gap-3">
          <UnitCrest size="nav" className="transition-opacity group-hover:opacity-95" priority />
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-foreground uppercase sm:text-base">
              O Carrista
            </span>
            <span className="hidden text-[0.6rem] tracking-[0.25em] text-gold-dim uppercase sm:block">
              De Santa Margarida
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {mainNavLinks.map((link) => (
            <motion.a key={link.href} href={link.href} className={navLinkClass} whileHover={{ y: -1 }}>
              {link.label}
            </motion.a>
          ))}
          {showLoja && (
            <motion.a href="#loja" className={navLinkClass} whileHover={{ y: -1 }}>
              Loja
            </motion.a>
          )}
          <motion.a href="#gesco" className={navLinkClass} whileHover={{ y: -1 }}>
            GesCO
          </motion.a>
          {session.authenticated ? (
            <>
              {session.role === "admin" && (
                <motion.a href="/admin" className={navLinkClass} whileHover={{ y: -1 }}>
                  Admin
                </motion.a>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={`${navLinkClass} ml-2 border-l border-gold/20 pl-8`}
              >
                Sair
              </button>
            </>
          ) : (
            <motion.div whileHover={{ y: -1 }} className="ml-2 border-l border-gold/20 pl-8">
              <Link href="/entrar" className={navLinkClass}>
                Login
              </Link>
            </motion.div>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-gold/20 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <span
            className={`h-px w-5 bg-gold transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`}
          />
          <span className={`h-px w-5 bg-gold transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-px w-5 bg-gold transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="border-t border-gold/10 bg-background/95 py-6 pl-5 pr-4 text-left backdrop-blur-lg sm:pl-8 md:hidden">
          <ul className="flex flex-col gap-4">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-sm tracking-[0.15em] text-gold uppercase"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {showLoja && (
              <li>
                <a
                  href="#loja"
                  className="font-display text-sm tracking-[0.15em] text-gold uppercase"
                  onClick={() => setOpen(false)}
                >
                  Loja
                </a>
              </li>
            )}
            <li>
              <a
                href="#gesco"
                className="font-display text-sm tracking-[0.15em] text-gold uppercase"
                onClick={() => setOpen(false)}
              >
                GesCO
              </a>
            </li>
            <li className="border-t border-gold/10 pt-4">
              {session.authenticated ? (
                <div className="flex flex-col gap-3">
                  {session.role === "admin" && (
                    <Link
                      href="/admin"
                      className="font-display text-sm tracking-[0.15em] text-gold uppercase"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="text-left font-display text-sm tracking-[0.15em] text-gold uppercase"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  href="/entrar"
                  className="font-display text-sm tracking-[0.15em] text-gold uppercase"
                  onClick={() => {
                    setOpen(false);
                    refresh();
                  }}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
