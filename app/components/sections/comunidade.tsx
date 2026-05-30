import { SectionShell } from "../section-shell";
import { IconUsers, IconShop } from "../icons";

const benefits = [
  "Acesso à Loja do Carrista — prendas e artigos exclusivos",
  "Inscrição e informação sobre os 7 eventos anuais",
  "Rede de veteranos, famílias e amigos do QCav e do Ex-RC4",
  "Informação sobre eventos e atividades da comunidade",
];

export function ComunidadeSection() {
  return (
    <SectionShell
      id="comunidade"
      label="Secção 04 · Comunidade"
      title="Aderir & Comprar"
      description="Registe-se como novo membro para integrar a comunidade O Carrista e aceder à Loja do Carrista ou Eventos com participação exterior."
      alt
    >
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
            Preencha o formulário para solicitar adesão. Após confirmação, poderá
            comprar na Loja do Carrista e aceder a todos os benefícios da
            comunidade.
          </p>
          <form className="flex flex-col gap-4" action="#" method="post">
            <label className="sr-only" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              placeholder="Nome completo"
              required
              autoComplete="name"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
            />
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              required
              autoComplete="email"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
            />
            <button type="submit" className="btn-primary w-full">
              Solicitar adesão
            </button>
          </form>
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
                  Aceda à Loja do Carrista para adquirir prendas e artigos
                  comemorativos.
                </p>
              </div>
            </div>
            <a href="#loja" className="btn-outline shrink-0 text-center">
              Ir à Loja
            </a>
          </div>

          <blockquote className="border-l-2 border-gold/50 pl-6">
            <p className="text-lg italic text-muted leading-relaxed">
              &ldquo;De Santa Margarida saíram carristas; a comunidade mantém
              viva essa herança.&rdquo;
            </p>
            <footer className="mt-3 font-display text-xs tracking-[0.2em] text-gold uppercase">
              — O Carrista
            </footer>
          </blockquote>
        </div>
      </div>
    </SectionShell>
  );
}
