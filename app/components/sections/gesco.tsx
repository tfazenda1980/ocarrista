import { SectionShell } from "../section-shell";
import { IconPlatform } from "../icons";
import { gescoExternalLink } from "../../lib/gesco";

const features = [
  {
    label: "Competências",
    desc: "Registo e acompanhamento de competências técnicas, táticas e operacionais.",
  },
  {
    label: "Formação",
    desc: "Planos formativos, qualificações e evolução por função e especialidade.",
  },
  {
    label: "Avaliação",
    desc: "Critérios de avaliação, histórico e requisitos para progressão.",
  },
  {
    label: "Prontidão",
    desc: "Indicadores de prontidão operacional ao nível individual e de equipa.",
  },
  {
    label: "Relatórios",
    desc: "Dashboards e sínteses para comando e gestão de recursos humanos.",
  },
  {
    label: "Acesso restrito",
    desc: "Plataforma interna — uso autorizado no âmbito institucional.",
  },
];

export function GescoSection() {
  return (
    <SectionShell
      id="gesco"
      label="Secção 05 · Plataforma interna"
      title="GesCO"
      description="Gestão de Competências Operacionais — plataforma interna de apoio à formação, avaliação e prontidão no Exército."
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
                  <p className="font-mono text-[0.6rem] text-muted">
                    Gestão de Competências Operacionais
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.65rem] text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                INTERNO
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { cmd: "status", out: "Plataforma operacional — ambiente beta" },
                { cmd: "competencias --sync", out: "Catálogo de competências atualizado" },
                { cmd: "prontidao --report", out: "Relatório de prontidão · Q2 2026" },
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
          <p className="mb-4 font-display text-sm tracking-[0.12em] text-gold uppercase">
            Plataforma interna
          </p>
          <p className="mb-8 leading-relaxed text-muted">
            O GesCO não é um serviço público do site O Carrista. É a ferramenta
            institucional para gerir competências operacionais — formação,
            avaliação e indicadores de prontidão — com acesso reservado a
            utilizadores autorizados.
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

          <p className="mt-8 text-sm text-muted/90">
            Utilizadores com credenciais podem aceder ao ambiente beta.
          </p>
          <a {...gescoExternalLink} className="btn-outline mt-4 inline-flex">
            Aceder à plataforma (interno)
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
