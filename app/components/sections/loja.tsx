import Image from "next/image";
import { SectionShell } from "../section-shell";
import { IconShop } from "../icons";
import { LojaProductRequest } from "../loja/loja-product-request";
import { getLojaProducts } from "../../lib/loja/products";

const products = getLojaProducts();

type LojaSectionProps = {
  memberName?: string;
};

export function LojaSection({ memberName }: LojaSectionProps) {
  return (
    <SectionShell
      id="loja"
      label="Secção 03 · Loja"
      title="Loja do Carrista"
      description="Artigos exclusivos para membros. Não há pagamento no site — cada pedido é enviado por email à organização, que responde com os detalhes."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-gold uppercase">
          Membro autorizado
        </span>
        {memberName && (
          <p className="text-sm text-muted">
            Sessão: <span className="text-foreground">{memberName}</span>
          </p>
        )}
      </div>

      <p className="mb-10 max-w-3xl text-sm leading-relaxed text-muted">
        Clique em <strong className="text-foreground">Solicitar</strong> no artigo pretendido.
        A organização recebe o pedido por email (com o seu nome e email de membro) e
        contacta-o para quantidade, entrega e pagamento — fora do site.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="card-tactical group flex flex-col p-6"
          >
            <div className="relative mb-4 aspect-[4/3] overflow-hidden border border-gold/15 bg-background/60 transition-colors group-hover:border-gold/30">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-3"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <IconShop />
                </div>
              )}
            </div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground uppercase">
              {product.name}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{product.note}</p>
            <div className="mt-4 flex flex-col gap-3 border-t border-gold/10 pt-4">
              <LojaProductRequest productName={product.name} />
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
