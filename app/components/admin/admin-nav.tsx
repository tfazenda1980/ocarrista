"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumo" },
  { href: "/admin/adesoes", label: "Adesões" },
  { href: "/admin/perguntas", label: "Perguntas workshop" },
];

export function AdminNav() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/entrar");
    router.refresh();
  };

  return (
    <nav className="mb-10 flex flex-wrap gap-4 border-b border-gold/20 pb-4">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="font-display text-xs tracking-[0.14em] text-gold/80 uppercase hover:text-gold"
        >
          {l.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={logout}
        className="ml-auto font-mono text-[0.65rem] text-muted hover:text-gold"
      >
        Sair
      </button>
    </nav>
  );
}
