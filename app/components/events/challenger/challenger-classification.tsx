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

const CELL_WHITE = "text-foreground";
const CELL_RED = "text-red-400";
const CELL_EMPTY = "text-muted";

function formatPenaltyMinutes(min: number | null): string {
  if (min == null || min === 0) return "—";
  return `${Math.round(min * 10) / 10} min`;
}

function ValueCell({
  value,
  tone = "white",
  mono = true,
}: {
  value: string | number | null | undefined;
  tone?: "white" | "red" | "empty";
  mono?: boolean;
}) {
  const display =
    value === null || value === undefined || value === "" ? "—" : String(value);
  const isEmpty = display === "—";
  const color =
    tone === "red" ? CELL_RED : tone === "empty" || isEmpty ? CELL_EMPTY : CELL_WHITE;

  return (
    <span className={`${mono ? "font-mono" : ""} ${color}`}>{isEmpty ? "—" : display}</span>
  );
}

function ProvaCell({
  points,
  penalty,
}: {
  points: number | undefined;
  penalty: number | undefined;
}) {
  const hasPoints = points !== undefined;
  const hasPenalty = penalty !== undefined && penalty !== 0;

  if (!hasPoints && !hasPenalty) {
    return <span className={CELL_EMPTY}>—</span>;
  }

  return (
    <div className="flex flex-col items-center gap-0.5 font-mono text-[0.65rem] sm:text-xs">
      <span className={hasPoints ? CELL_WHITE : CELL_EMPTY}>{hasPoints ? points : "—"}</span>
      {hasPenalty ? <span className={CELL_RED}>{penalty}</span> : null}
    </div>
  );
}

const thGroup =
  "border-l border-gold/15 px-1.5 py-1.5 text-center text-[0.55rem] tracking-[0.1em] text-gold/80 uppercase sm:px-2 sm:text-[0.6rem]";
const thCol =
  "whitespace-nowrap px-1 py-1.5 text-[0.55rem] tracking-[0.06em] text-muted uppercase sm:px-1.5 sm:text-[0.6rem]";
const tdBase = "whitespace-nowrap px-1.5 py-2.5 sm:px-2 sm:py-3";

function StandingsTable({
  title,
  standings,
  provas,
  highlightChanges,
  showProvisionalColumns = true,
  showFinalColumns = false,
}: {
  title: string;
  standings: ChallengerStanding[];
  provas: ChallengerProva[];
  highlightChanges?: Map<string, string[]>;
  showProvisionalColumns?: boolean;
  showFinalColumns?: boolean;
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

  const provColSpan = showProvisionalColumns ? provas.length : 0;
  const provSummarySpan = showProvisionalColumns ? 3 : 0;
  const pistaSpan = showFinalColumns ? 2 : 0;
  const finalSpan = showFinalColumns ? 1 : 0;

  return (
    <div className="card-tactical p-4 sm:p-6">
      <h3 className="font-display mb-3 text-sm font-semibold tracking-[0.12em] text-gold uppercase">
        {title}
      </h3>
      <p className="mb-3 text-[0.65rem] text-muted sm:hidden">Deslize para ver a tabela completa →</p>
      <div className="challenger-standings-scroll -mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
        <table className="w-max min-w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              <th
                rowSpan={2}
                className="sticky left-0 z-20 bg-surface-elevated px-1.5 py-2 sm:px-2"
              >
                <span className="text-[0.6rem] tracking-[0.08em] text-muted uppercase sm:text-[0.65rem]">
                  Pos.
                </span>
              </th>
              <th
                rowSpan={2}
                className="sticky left-[2.25rem] z-20 min-w-[5.5rem] bg-surface-elevated px-1.5 py-2 sm:left-[2.5rem] sm:min-w-[6.5rem] sm:px-2"
              >
                <span className="text-[0.6rem] tracking-[0.08em] text-muted uppercase sm:text-[0.65rem]">
                  Guarnição
                </span>
              </th>
              {showProvisionalColumns && provColSpan > 0 && (
                <th colSpan={provColSpan} className={thGroup}>
                  Provas
                </th>
              )}
              {showProvisionalColumns && provSummarySpan > 0 && (
                <th colSpan={provSummarySpan} className={thGroup}>
                  Class. provisória
                </th>
              )}
              {showFinalColumns && pistaSpan > 0 && (
                <th colSpan={pistaSpan} className={thGroup}>
                  Pista Carrista
                </th>
              )}
              {showFinalColumns && finalSpan > 0 && (
                <th colSpan={finalSpan} className={thGroup}>
                  Class. final
                </th>
              )}
            </tr>
            <tr className="border-b border-gold/20">
              {showProvisionalColumns &&
                provas.map((p, i) => (
                  <th
                    key={p.id}
                    title={p.title}
                    className={`${thCol} w-11 min-w-[2.75rem] text-center font-mono normal-case tracking-normal`}
                  >
                    {provaShortLabel(p.title, i)}
                  </th>
                ))}
              {showProvisionalColumns && (
                <>
                  <th className={`${thCol} border-l border-gold/15`}>T. final</th>
                  <th className={thCol}>T. pen.</th>
                  <th className={thCol}>Pts pen.</th>
                </>
              )}
              {showFinalColumns && (
                <>
                  <th className={`${thCol} border-l border-gold/15`}>Tempo</th>
                  <th className={thCol}>Pen.</th>
                  <th className={`${thCol} border-l border-gold/15`}>T. Challenger</th>
                </>
              )}
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
                  {showProvisionalColumns &&
                    provas.map((p) => (
                      <td key={p.id} className="w-11 min-w-[2.75rem] px-1 py-2.5 text-center sm:py-3">
                        <ProvaCell
                          points={row.provaPoints[p.id]}
                          penalty={row.provaPenalties[p.id]}
                        />
                      </td>
                    ))}
                  {showProvisionalColumns && (
                    <>
                      <td className={`${tdBase} border-l border-gold/10 text-center`}>
                        <ValueCell value={row.provisionalFinalTime} tone="white" />
                      </td>
                      <td className={`${tdBase} text-center`}>
                        <ValueCell
                          value={formatPenaltyMinutes(row.penaltyTimeMin)}
                          tone={
                            row.penaltyTimeMin != null && row.penaltyTimeMin !== 0
                              ? "red"
                              : "empty"
                          }
                        />
                      </td>
                      <td className={`${tdBase} text-center`}>
                        <ValueCell
                          value={row.penaltyPoints}
                          tone={
                            row.penaltyPoints != null && row.penaltyPoints !== 0 ? "red" : "empty"
                          }
                        />
                      </td>
                    </>
                  )}
                  {showFinalColumns && (
                    <>
                      <td className={`${tdBase} border-l border-gold/10 text-center`}>
                        <ValueCell
                          value={row.trackTime}
                          tone={row.trackTime ? "white" : "empty"}
                        />
                      </td>
                      <td className={`${tdBase} text-center`}>
                        <ValueCell
                          value={row.trackPenalty}
                          tone={
                            row.trackPenalty != null && row.trackPenalty !== 0 ? "red" : "empty"
                          }
                        />
                      </td>
                      <td className={`${tdBase} border-l border-gold/10 text-center`}>
                        <ValueCell
                          value={row.challengerFinalTime}
                          tone={row.challengerFinalTime ? "white" : "empty"}
                        />
                      </td>
                    </>
                  )}
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
  standings: ChallengerStanding[];
  showProvisional: boolean;
  showFinal: boolean;
};

export function ChallengerClassification({
  provas,
  standings,
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

        {showProvisional || showFinal ? (
          <MotionReveal delay={0.05}>
            <StandingsTable
              title="Classificação"
              standings={standings}
              provas={provas}
              showProvisionalColumns={showProvisional}
              showFinalColumns={showFinal}
            />
          </MotionReveal>
        ) : (
          <p className="text-sm text-muted">
            As classificações serão publicadas pela organização durante o evento.
          </p>
        )}
      </div>
    </section>
  );
}

export { StandingsTable, ProvaCell };
