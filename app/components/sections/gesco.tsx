import { SectionShell } from "../section-shell";
import { IconPlatform } from "../icons";

const features = [
  { label: "Gestão de Membros", desc: "Base de dados centralizada e perfis operacionais" },
  { label: "Eventos & Inscrições", desc: "Calendário integrado com confirmações automáticas" },
  { label: "Comunicações", desc: "Alertas, newsletters e canais segmentados" },
  { label: "Arquivo Digital", desc: "Documentos, fotografias e registos históricos" },
  { label: "Loja do Carrista", desc: "Catálogo, encomendas e gestão de vendas a membros" },
  { label: "Comunidade", desc: "Adesões, fóruns e diretório de membros" },
  { label: "Relatórios", desc: "Dashboards e métricas para a direção" },
];

export function GescoSection() {
  return (
    <SectionShell
      id="gesco"
      label="Secção 05 · GesCO"
      title="GesCO"
      description="Gestão da Comunidade O Carrista — a infraestrutura digital que sustenta operações, eventos e comunicação em tempo real."
      alt
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="card-tactical relative overflow-hidden border-gold/25 p-1">
          <div className="border border-gold/10 bg-surface-elevated p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-gold/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-gold/40 text-gold">
                  <IconPlatform />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold tracking-wider uppercase">
                    GesCO
                  </p>
                  <p className="font-mono text-[0.6rem] text-muted">v2.4 · OPERACIONAL</p>
                </div>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.65rem] text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                ONLINE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { cmd: "status", out: "Sistema operacional — 847 membros ativos" },
                { cmd: "events --next", out: "Encontro Nacional · 14 MAR 2026" },
                { cmd: "comunidade --sync", out: "Rede sincronizada · 12 regiões" },
              ].map((line) => (
                <div key={line.cmd} className="rounded border border-gold/10 bg-background/60 p-3">
                  <p className="text-gold">
                    <span className="text-muted">$</span> {line.cmd}
                  </p>
                  <p className="mt-1 text-muted">{line.out}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-8 text-muted leading-relaxed">
            O GesCO foi concebido para as necessidades específicas da comunidade
            carrista: segurança, fiabilidade e uma experiência digna de uma
            organização de elite.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="border border-gold/12 bg-surface/80 p-4 transition-colors hover:border-gold/30"
              >
                <h4 className="font-display text-xs font-semibold tracking-[0.12em] text-gold uppercase">
                  {f.label}
                </h4>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <a href="#" className="btn-primary mt-8 inline-flex">
            Aceder ao GesCO
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
