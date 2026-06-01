import Link from "next/link";
import { SectionShell } from "../section-shell";
import { IconUsers, IconShop, IconShield } from "../icons";
import { ComunidadeJoinForm } from "../comunidade/comunidade-join-form";
import { MemberAccessProcedure } from "../comunidade/member-access-procedure";
import type { ComunidadeView } from "@/app/lib/auth/member-access";

const benefits = [
  "Acesso à Loja do Carrista — prendas e artigos exclusivos (após aprovação)",
  "Inscrição e informação sobre os 7 eventos anuais",
  "Rede de veteranos, famílias e amigos do QCav e do Ex-RC4",
  "Informação sobre eventos e atividades da comunidade",
];

type ComunidadeSectionProps = {
  view: ComunidadeView;
  memberName?: string;
};

function ComunidadeGuest() {
  return (
    <>
      <div className="mb-10">
        <MemberAccessProcedure />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="card-tactical corner-brackets relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -right-8 -top-8 h-32 w-32 border border-gold/10 rotate-45 opacity-50" />
          <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
            <IconUsers />
          </div>
          <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
            Novo membro
          </h3>
          <p className="mb-8 text-muted leading-relaxed">
            Preencha o formulário para solicitar adesão. Após confirmação da
            administração, receberá email para definir a password e aceder à Loja.
          </p>
          <ComunidadeJoinForm />
        </div>

        <div className="flex flex-col gap-8">
          <ul className="space-y-5">
            {benefits.map((benefit, i) => (
              <li key={benefit} className="flex gap-4">
                <span className="font-display shrink-0 text-lg font-bold text-gold/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-base text-foreground">{benefit}</p>
              </li>
            ))}
          </ul>

          <div className="card-tactical flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
                <IconShop />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
                  Já é membro?
                </h4>
                <p className="mt-1 text-sm text-muted">
                  Faça login para ver a Loja do Carrista no menu.
                </p>
              </div>
            </div>
            <Link href="/entrar" className="btn-outline shrink-0 text-center">
              Login
            </Link>
          </div>

          <ComunidadeQuote />
        </div>
      </div>
    </>
  );
}

function ComunidadeQuote() {
  return (
    <blockquote className="border-l-2 border-gold/50 pl-6">
      <p className="text-lg italic text-muted leading-relaxed">
        &ldquo;De Santa Margarida saíram carristas; a comunidade mantém viva essa
        herança.&rdquo;
      </p>
      <footer className="mt-3 font-display text-xs tracking-[0.2em] text-gold uppercase">
        — O Carrista
      </footer>
    </blockquote>
  );
}

function ComunidadeMember({ memberName }: { memberName?: string }) {
  const greeting = memberName?.trim() ? `Olá, ${memberName}` : "Sessão de membro";

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="card-tactical p-8 sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
          <IconUsers />
        </div>
        <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
          {greeting}
        </h3>
        <p className="mb-6 text-muted leading-relaxed">
          Está autenticado como membro da comunidade O Carrista. Pode aceder à Loja,
          consultar eventos e beneficiar da rede Ex-RC4 / QCav.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="#loja" className="btn-primary">
            Ir à Loja
          </Link>
          <Link href="#eventos" className="btn-outline">
            Ver eventos
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ul className="space-y-4 text-sm text-muted">
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>Loja do Carrista — solicite artigos por email (sem pagamento no site)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>Agenda anual de eventos no Quartel da Cavalaria</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>Para sair, use <strong className="text-foreground">Sair</strong> no menu superior</span>
          </li>
        </ul>
        <ComunidadeQuote />
      </div>
    </div>
  );
}

function ComunidadeAdmin() {
  return (
    <div className="card-tactical max-w-2xl p-8 sm:p-10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
        <IconShield />
      </div>
      <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
        Sessão de administrador
      </h3>
      <p className="mb-6 text-muted leading-relaxed">
        Pode continuar a navegar no site (Eventos, História, GesCO, etc.). O
        painel de adesões e perguntas está na secção{" "}
        <strong className="text-foreground">Administração</strong> abaixo — ou use
        o aviso no topo e o link <strong className="text-foreground">Admin</strong>{" "}
        no menu.
      </p>
      <Link href="#admin" className="btn-primary inline-flex">
        Ir ao painel
      </Link>
    </div>
  );
}

const shellCopy: Record<
  ComunidadeView,
  { title: string; description: string; label: string }
> = {
  guest: {
    label: "Secção 04 · Comunidade",
    title: "Aderir & Comprar",
    description:
      "Registe-se como novo membro para integrar a comunidade O Carrista e, após aprovação, aceder à Loja do Carrista.",
  },
  member: {
    label: "Secção 04 · Comunidade",
    title: "A sua comunidade",
    description: "Área reservada a membros aprovados — O Carrista, Ex-RC4 e QCav.",
  },
  admin: {
    label: "Secção 04 · Comunidade",
    title: "Comunidade",
    description: "Como administrador, utilize o painel na secção Administração (abaixo) para adesões e perguntas.",
  },
};

export function ComunidadeSection({ view, memberName }: ComunidadeSectionProps) {
  const copy = shellCopy[view];

  return (
    <SectionShell
      id="comunidade"
      label={copy.label}
      title={copy.title}
      description={copy.description}
      alt
    >
      {view === "guest" && <ComunidadeGuest />}
      {view === "member" && <ComunidadeMember memberName={memberName} />}
      {view === "admin" && <ComunidadeAdmin />}
    </SectionShell>
  );
}
