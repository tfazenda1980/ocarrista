import Link from "next/link";

/** Texto visível a todos os visitantes — fluxo de adesão e password. */
export function MemberAccessProcedure() {
  return (
    <aside className="card-tactical border-gold/25 bg-gold/5 p-6 sm:p-8">
      <p className="section-label mb-3">Como tornar-se membro</p>
      <h3 className="font-display mb-4 text-lg font-semibold tracking-wide text-foreground uppercase">
        Acesso à Loja e Login
      </h3>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
        <li>
          Preencha o formulário abaixo com nome e email para <strong className="text-foreground">solicitar adesão</strong>.
        </li>
        <li>
          A administração analisa o pedido e, se for aprovado, recebe um email de{" "}
          <strong className="text-foreground">O Carrista</strong> com um link para{" "}
          <strong className="text-foreground">definir a sua password</strong> (válido 7 dias).
        </li>
        <li>
          Depois use esse email e essa password em{" "}
          <Link href="/entrar" className="text-gold hover:underline">
            Login
          </Link>{" "}
          no site para aceder à <strong className="text-foreground">Loja do Carrista</strong>.
        </li>
      </ol>
      <p className="mt-5 border-t border-gold/15 pt-5 text-sm leading-relaxed text-muted">
        A organização <strong className="text-foreground">não envia passwords por mensagem</strong>{" "}
        — cada membro escolhe a sua no link do email de aprovação.
      </p>
    </aside>
  );
}
