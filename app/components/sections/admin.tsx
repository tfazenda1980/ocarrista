import Link from "next/link";
import { SectionShell } from "../section-shell";
import { IconShield } from "../icons";

const shortcuts = [
  {
    href: "/admin/entrar",
    title: "Entrar na administração",
    description: "Acesso com nickname e password de administrador.",
    primary: true,
  },
  {
    href: "/admin/adesoes",
    title: "Pedidos de adesão",
    description: "Autorizar ou recusar novos membros da comunidade.",
  },
  {
    href: "/admin/perguntas",
    title: "Perguntas do workshop",
    description: "Moderar perguntas ao debate (Workshop 2026).",
  },
] as const;

export function AdminSection() {
  return (
    <SectionShell
      id="admin"
      label="Secção 06 · Administração"
      title="Admin"
      description="Área reservada à organização O Carrista — gestão de adesões e moderação de perguntas nos eventos."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => {
          const isPrimary = "primary" in item && item.primary;
          return (
          <Link
            key={item.href}
            href={item.href}
            className={`card-tactical group flex flex-col gap-4 p-6 transition-colors sm:p-8 ${
              isPrimary ? "border-gold/35 bg-gold/5 lg:col-span-1" : ""
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/5 text-gold transition-colors group-hover:border-gold/60 group-hover:bg-gold/10">
              <IconShield />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-wide text-foreground uppercase group-hover:text-gold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
            <span
              className={`mt-auto font-display text-[0.65rem] tracking-[0.2em] uppercase ${
                isPrimary ? "text-gold" : "text-gold/70 group-hover:text-gold"
              }`}
            >
              {isPrimary ? "Iniciar sessão →" : "Abrir →"}
            </span>
          </Link>
          );
        })}
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted/80">
        Membros da comunidade devem usar{" "}
        <Link href="/entrar" className="text-gold/90 underline-offset-2 hover:text-gold hover:underline">
          Entrar
        </Link>{" "}
        em /entrar. Esta secção é apenas para administradores autorizados.
      </p>
    </SectionShell>
  );
}
