"use client";

import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { UnitCrest } from "./unit-crest";

const navLinks = [
  { href: "#eventos", label: "Eventos" },
  { href: "#historia", label: "História" },
  { href: "#loja", label: "Loja" },
  { href: "#comunidade", label: "Comunidade" },
  { href: "#gesco", label: "GesCO" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gold/15 bg-background/65 shadow-[0_10px_40px_rgba(0,0,0,0.55)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6">
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
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="font-display text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
              whileHover={{ y: -1 }}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.a
            href="#comunidade"
            className="btn-primary px-5 py-2.5 text-[0.65rem]"
            whileHover={{ y: -1 }}
          >
            Aderir
          </motion.a>
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
        <nav className="border-t border-gold/10 bg-background/95 px-4 py-6 backdrop-blur-lg md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-sm tracking-[0.15em] text-foreground uppercase"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#comunidade"
                className="btn-primary w-full text-center"
                onClick={() => setOpen(false)}
              >
                Aderir
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
