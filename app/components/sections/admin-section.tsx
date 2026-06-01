import Link from "next/link";
import { SectionShell } from "../section-shell";
import { AdminNav } from "../admin/admin-nav";
import { AdminAdesoesPanel } from "../admin/admin-adesoes-panel";
import { AdminQaPanel } from "../admin/admin-qa-panel";

type AdminSectionProps = {
  pendingCount: number;
};

export function AdminSection({ pendingCount }: AdminSectionProps) {
  const workshopYear = "2026";

  return (
    <SectionShell
      id="admin"
      label="Secção · Administração"
      title="Painel de administração"
      description="Gestão de adesões e moderação de perguntas do workshop — integrado no site, com acesso a Eventos, História e restantes secções pelo menu."
      alt
    >
      <AdminNav />

      <div id="admin-resumo" className="scroll-mt-28 mb-16">
        <h3 className="font-display mb-4 text-lg font-semibold tracking-wide uppercase">
          Resumo
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card-tactical p-6">
            <p className="text-3xl font-bold text-gold">{pendingCount}</p>
            <p className="text-sm text-muted">Pedidos de adesão pendentes</p>
            {pendingCount > 0 && (
              <Link href="#admin-adesoes" className="btn-primary mt-4 inline-flex text-xs">
                Ir para adesões
              </Link>
            )}
          </div>
          <div className="card-tactical p-6">
            <p className="font-display text-sm font-semibold tracking-wide text-foreground uppercase">
              Workshop {workshopYear}
            </p>
            <p className="mt-2 text-sm text-muted">
              Moderar perguntas ao debate nas salas do workshop.
            </p>
            <Link href="#admin-perguntas" className="btn-outline mt-4 inline-flex text-xs">
              Ir para perguntas
            </Link>
          </div>
        </div>
      </div>

      <div id="admin-adesoes" className="scroll-mt-28 mb-16">
        <h3 className="font-display mb-6 text-lg font-semibold tracking-wide uppercase">
          Adesões
        </h3>
        <AdminAdesoesPanel />
      </div>

      <div id="admin-perguntas" className="scroll-mt-28">
        <h3 className="font-display mb-6 text-lg font-semibold tracking-wide uppercase">
          Perguntas — Workshop {workshopYear}
        </h3>
        <AdminQaPanel year={workshopYear} />
      </div>
    </SectionShell>
  );
}
