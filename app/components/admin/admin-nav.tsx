"use client";

const links = [
  { href: "#admin", label: "Resumo" },
  { href: "/admin/membros", label: "Membros" },
  { href: "/admin/challenger/2026", label: "Challenger" },
  { href: "#admin-perguntas", label: "Perguntas workshop" },
] as const;

export function AdminNav() {
  return (
    <nav
      className="mb-10 flex flex-wrap gap-4 border-b border-gold/20 pb-4"
      aria-label="Navegação do painel de administração"
    >
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="font-display text-xs tracking-[0.14em] text-gold/80 uppercase hover:text-gold"
        >
          {l.label}
        </a>
      ))}
      <span className="ml-auto font-mono text-[0.6rem] text-muted">
        Use o menu superior para o resto do site · Sair para terminar sessão
      </span>
    </nav>
  );
}
