export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gold/15 bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.2em] uppercase">
              O Carrista
            </p>
            <p className="mt-1 font-display text-xs tracking-[0.2em] text-gold uppercase">
              De Santa Margarida
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Comunidade do QCav e Ex-RC4 — eventos, história e Loja do Carrista.
            </p>
            <p className="mt-2 max-w-sm text-xs text-muted/80">
              GesCO: plataforma interna de Gestão de Competências Operacionais
              (acesso restrito).
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { href: "#eventos", label: "Eventos" },
              { href: "#historia", label: "História" },
              { href: "#loja", label: "Loja" },
              { href: "#comunidade", label: "Comunidade" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#gesco"
              className="font-display text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-gold"
            >
              GesCO
            </a>
          </nav>
        </div>

        <div className="gold-line my-8" />

        <div className="flex flex-col gap-2 text-[0.7rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} O Carrista. Todos os direitos reservados.</p>
          <p className="font-mono tracking-wider uppercase">
            República Portuguesa · Forças Armadas
          </p>
        </div>
      </div>
    </footer>
  );
}
