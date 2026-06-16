import type {
  ChallengerCrew,
  ChallengerPhase,
  ChallengerProva,
  ChallengerScore,
  ChallengerStanding,
} from "./types";

export function computeStandings(
  crews: ChallengerCrew[],
  provas: ChallengerProva[],
  scores: ChallengerScore[],
  phase: ChallengerPhase,
): ChallengerStanding[] {
  const activeCrews = crews.filter((c) => c.active);
  const phaseScores = scores.filter((s) => s.phase === phase);

  const rows = activeCrews.map((crew) => {
    const crewScores = phaseScores.filter((s) => s.crew_id === crew.id);
    const provaPoints: Record<string, number> = {};
    let penalties = 0;
    let bonuses = 0;

    for (const score of crewScores) {
      const pts = Number(score.points);
      if (score.kind === "prova" && score.prova_id) {
        provaPoints[score.prova_id] = (provaPoints[score.prova_id] ?? 0) + pts;
      } else if (score.kind === "penalty") {
        penalties += pts;
      } else if (score.kind === "bonus") {
        bonuses += pts;
      }
    }

    const provaTotal = Object.values(provaPoints).reduce((a, b) => a + b, 0);
    const total = provaTotal + penalties + bonuses;

    return {
      crewId: crew.id,
      crewName: crew.name,
      sortOrder: crew.sort_order,
      total,
      rank: 0,
      provaPoints,
      penalties,
      bonuses,
    };
  });

  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.sortOrder - b.sortOrder;
  });

  let rank = 0;
  let prevTotal: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    if (prevTotal === null || rows[i].total !== prevTotal) {
      rank = i + 1;
      prevTotal = rows[i].total;
    }
    rows[i].rank = rank;
  }

  void provas;
  return rows;
}
