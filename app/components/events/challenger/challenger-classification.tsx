"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ChallengerProva, ChallengerStanding } from "@/app/lib/challenger/types";

function StandingsTable({
  title,
  standings,
  provas,
}: {
  title: string;
  standings: ChallengerStanding[];
  provas: ChallengerProva[];
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
    <div className="card-tactical overflow-x-auto p-4 sm:p-6">
      <h3 className="font-display mb-4 text-sm font-semibold tracking-[0.12em] text-gold uppercase">
        {title}
      </h3>
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-gold/20 text-[0.65rem] tracking-[0.1em] text-muted uppercase">
            <th className="px-2 py-2">Pos.</th>
            <th className="px-2 py-2">Guarnição</th>
            {provas.map((p) => (
              <th key={p.id} className="px-2 py-2">
                {p.title}
              </th>
            ))}
            <th className="px-2 py-2">Penal.</th>
            <th className="px-2 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.crewId} className="border-b border-gold/10">
              <td className="px-2 py-3 font-mono text-gold">{row.rank}º</td>
              <td className="px-2 py-3 font-medium">{row.crewName}</td>
              {provas.map((p) => (
                <td key={p.id} className="px-2 py-3 font-mono text-muted">
                  {row.provaPoints[p.id] !== undefined ? row.provaPoints[p.id] : "—"}
                </td>
              ))}
              <td className="px-2 py-3 font-mono text-muted">
                {row.penalties !== 0 ? row.penalties : "—"}
              </td>
              <td className="px-2 py-3 font-mono font-semibold text-foreground">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

        <div className="grid gap-8 lg:grid-cols-2">
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
