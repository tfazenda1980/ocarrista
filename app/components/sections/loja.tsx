import { SectionShell } from "../section-shell";
import { IconShop } from "../icons";

const products = [
  { name: "Coin GCC", price: "—", note: "Moeda comemorativa · GCC" },
  { name: "Coin ERec", price: "—", note: "Moeda comemorativa · ERec" },
  { name: "Galhardete GCC", price: "—", note: "Galhardete · GCC" },
  { name: "Galhardete ERec", price: "—", note: "Galhardete · ERec" },
  { name: "O Carrista", price: "—", note: "Artigo de identidade · comunidade" },
  { name: "Crachá GCC", price: "—", note: "Crachá · GCC" },
  { name: "Crachá ERec", price: "—", note: "Crachá · ERec" },
  { name: "Velcro GCC", price: "—", note: "Patch velcro · GCC" },
  { name: "Velcro ERec", price: "—", note: "Patch velcro · ERec" },
];

export function LojaSection() {
  return (
    <SectionShell
      id="loja"
      label="Secção 03 · Loja"
      title="Loja do Carrista"
      description="Prendas, vestuário e artigos comemorativos exclusivos para membros da comunidade — identidade O Carrista e orgulho Ex-RC4."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-gold uppercase">
          Acesso reservado a membros
        </span>
        <p className="text-sm text-muted">
          Aderir em{" "}
          <a href="#comunidade" className="text-gold hover:underline">
            Comunidade
          </a>{" "}
          para entrar como membro e comprar na loja.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.name}
            className="card-tactical group flex flex-col p-6"
          >
            <div className="mb-4 flex aspect-[4/3] items-center justify-center border border-gold/15 bg-background/60 transition-colors group-hover:border-gold/30">
              <IconShop />
            </div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground uppercase">
              {product.name}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{product.note}</p>
            <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-4">
              <span className="font-display text-lg text-gold">{product.price}</span>
              <a
                href="#comunidade"
                className="font-display text-[0.65rem] tracking-[0.15em] text-gold uppercase hover:underline"
              >
                Comprar →
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 border border-gold/15 bg-surface-elevated/80 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/40 text-gold">
            <IconShop />
          </div>
          <div>
            <p className="font-display text-sm tracking-[0.15em] text-gold uppercase">
              Loja online para membros
            </p>
            <p className="mt-1 max-w-lg text-muted">
              Entre como membro na Comunidade para aceder ao catálogo completo,
              encomendas e entregas.
            </p>
          </div>
        </div>
        <a href="#comunidade" className="btn-primary shrink-0">
          Entrar na Comunidade
        </a>
      </div>
    </SectionShell>
  );
}
