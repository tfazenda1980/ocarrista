"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerProva, ChallengerStanding } from "@/app/lib/challenger/types";

/** Extrai «1.1», «2», etc. do título completo da prova. */
export function provaShortLabel(title: string, index: number): string {
  const dotted = title.match(/(\d+\.\d+)/);
  if (dotted) return dotted[1];
  const plain = title.match(/(?:prova\s*)?(\d+)/i);
  if (plain) return plain[1];
  const keys = ["1.1", "1.2", "1.3", "1.4", "2", "3", "4"];
  return keys[index] ?? String(index + 1);
}

function formatPenaltyTime(min: number | null): string {
  if (min == null || min === 0) return "—";
  return `${Math.round(min * 10) / 10} min`;
}

function ProvaCell({
  points,
  penalty,
}: {
  points: number | undefined;
  penalty: number | undefined;
}) {
  if (points === undefined && (penalty === undefined || penalty === 0)) {
    return <span className="text-muted">—</span>;
  }
  return (
    <span className="font-mono text-[0.65rem] text-muted sm:text-xs">
      {points !== undefined ? points : "—"}
      {penalty !== undefined && penalty !== 0 ? (
        <span className="text-red-400/80"> / {penalty}</span>
      ) : null}
    </span>
  );
}

function StandingsTable({
  title,
  standings,
  provas,
  highlightChanges,
}: {
  title: string;
  standings: ChallengerStanding[];
  provas: ChallengerProva[];
  highlightChanges?: Map<string, string[]>;
}) {
  if (standings.length === 0) {
    return (
      <div className="card-tactical p-6">
        <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
          {title}
        </h3>
        <p className="mt-3 text-sm text-muted">Classificação ainda não publicada.</p>
      </div>
    );
  }

  return (
    <div className="card-tactical p-4 sm:p-6">
      <h3 className="font-display mb-3 text-sm font-semibold tracking-[0.12em] text-gold uppercase">
        {title}
      </h3>
      <p className="mb-3 text-[0.65rem] text-muted sm:hidden">Deslize para ver a tabela completa →</p>
      <div className="challenger-standings-scroll -mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
        <table className="w-max min-w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-[0.6rem] tracking-[0.08em] text-muted uppercase sm:text-[0.65rem]">
              <th className="sticky left-0 z-10 bg-surface-elevated px-1.5 py-2 sm:px-2">Pos.</th>
              <th className="sticky left-[2.25rem] z-10 min-w-[5.5rem] bg-surface-elevated px-1.5 py-2 sm:left-[2.5rem] sm:min-w-[6.5rem] sm:px-2">
                Guarnição
              </th>
              {provas.map((p, i) => (
                <th
                  key={p.id}
                  title={p.title}
                  className="w-11 min-w-[2.75rem] px-1 py-2 text-center font-mono normal-case tracking-normal"
                >
                  {provaShortLabel(p.title, i)}
                </th>
              ))}
              <th className="whitespace-nowrap px-1.5 py-2 sm:px-2">Início</th>
              <th className="whitespace-nowrap px-1.5 py-2 sm:px-2">Tempo</th>
              <th className="whitespace-nowrap px-1.5 py-2 sm:px-2">Pen.</th>
              <th className="whitespace-nowrap px-1.5 py-2 sm:px-2">Final</th>
              <th className="whitespace-nowrap px-1.5 py-2 sm:px-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const changes = highlightChanges?.get(row.crewId);
              return (
                <tr
                  key={row.crewId}
                  className={`border-b border-gold/10 ${changes?.length ? "bg-gold/5" : ""}`}
                >
                  <td className="sticky left-0 z-10 bg-surface-elevated px-1.5 py-2.5 font-mono text-gold sm:px-2 sm:py-3">
                    {row.rank > 0 ? `${row.rank}º` : "—"}
                  </td>
                  <td className="sticky left-[2.25rem] z-10 min-w-[5.5rem] bg-surface-elevated px-1.5 py-2.5 text-xs font-medium sm:left-[2.5rem] sm:min-w-[6.5rem] sm:px-2 sm:py-3 sm:text-sm">
                    {row.crewName}
                  </td>
                  {provas.map((p) => (
                    <td key={p.id} className="w-11 min-w-[2.75rem] px-1 py-2.5 text-center sm:py-3">
                      <ProvaCell
                        points={row.provaPoints[p.id]}
                        penalty={row.provaPenalties[p.id]}
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-1.5 py-2.5 font-mono text-muted sm:px-2 sm:py-3">
                    {row.startTime ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 font-mono text-muted sm:px-2 sm:py-3">
                    {row.grossTime ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 font-mono text-muted sm:px-2 sm:py-3">
                    {formatPenaltyTime(row.penaltyTimeMin)}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 font-mono font-medium text-foreground sm:px-2 sm:py-3">
                    {row.finalTime ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2.5 font-mono text-muted sm:px-2 sm:py-3">
                    {row.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ChallengerClassificationProps = {
  provas: ChallengerProva[];
  provisional: ChallengerStanding[];
  final: ChallengerStanding[];
  showProvisional: boolean;
  showFinal: boolean;
};

export function ChallengerClassification({
  provas,
  provisional,
  final,
  showProvisional,
  showFinal,
}: ChallengerClassificationProps) {
  return (
    <section id="classificacao" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">04 · Classificação</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Classificação
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <div className="grid min-w-0 gap-8 xl:grid-cols-1">
          {showProvisional && (
            <MotionReveal delay={0.05}>
              <StandingsTable
                title="Classificação provisória"
                standings={provisional}
                provas={provas}
              />
            </MotionReveal>
          )}
          {showFinal && (
            <MotionReveal delay={0.1}>
              <StandingsTable
                title="Classificação final"
                standings={final}
                provas={provas}
              />
            </MotionReveal>
          )}
          {!showProvisional && !showFinal && (
            <p className="text-sm text-muted">
              As classificações serão publicadas pela organização durante o evento.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export { StandingsTable, ProvaCell };
