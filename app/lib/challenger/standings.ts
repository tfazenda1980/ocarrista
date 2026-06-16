import type {
  ChallengerCrew,
  ChallengerCrewResult,
  ChallengerPhase,
  ChallengerProva,
  ChallengerScore,
  ChallengerStanding,
} from "./types";
import { parseTimeToSeconds } from "./time-format";

export function computeStandings(
  crews: ChallengerCrew[],
  provas: ChallengerProva[],
  scores: ChallengerScore[],
  phase: ChallengerPhase,
  crewResults: ChallengerCrewResult[] = [],
): ChallengerStanding[] {
  const activeCrews = crews.filter((c) => c.active);
  const phaseScores = scores.filter((s) => s.phase === phase);
  const resultsByCrew = new Map(
    crewResults.filter((r) => r.phase === phase).map((r) => [r.crew_id, r]),
  );

  const rows = activeCrews.map((crew) => {
    const crewScores = phaseScores.filter((s) => s.crew_id === crew.id);
    const provaPoints: Record<string, number> = {};
    const provaPenalties: Record<string, number> = {};
    let penalties = 0;
    let bonuses = 0;

    for (const score of crewScores) {
      const pts = Number(score.points);
      if (score.kind === "prova" && score.prova_id) {
        provaPoints[score.prova_id] = (provaPoints[score.prova_id] ?? 0) + pts;
      } else if (score.kind === "penalty") {
        if (score.prova_id) {
          provaPenalties[score.prova_id] = (provaPenalties[score.prova_id] ?? 0) + pts;
        }
        penalties += pts;
      } else if (score.kind === "bonus") {
        bonuses += pts;
      }
    }

    const provaTotal = Object.values(provaPoints).reduce((a, b) => a + b, 0);
    const total = provaTotal + penalties + bonuses;
    const result = resultsByCrew.get(crew.id);

    return {
      crewId: crew.id,
      crewName: crew.name,
      sortOrder: crew.sort_order,
      total,
      rank: result?.rank ?? 0,
      provaPoints,
      provaPenalties,
      penalties,
      bonuses,
      startTime: result?.start_time ?? null,
      endTime: result?.end_time ?? null,
      grossTime: result?.gross_time ?? null,
      penaltyTimeMin: result?.penalty_time_min ?? null,
      finalTime: result?.final_time ?? null,
    };
  });

  const hasImportedRanks = rows.some((r) => r.rank > 0);

  if (hasImportedRanks) {
    rows.sort((a, b) => {
      if (a.rank === 0 && b.rank === 0) return a.sortOrder - b.sortOrder;
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.sortOrder - b.sortOrder;
    });
  } else {
    rows.sort((a, b) => {
      const ta = parseTimeToSeconds(a.finalTime);
      const tb = parseTimeToSeconds(b.finalTime);
      if (ta != null && tb != null && ta !== tb) return ta - tb;
      if (ta != null && tb == null) return -1;
      if (ta == null && tb != null) return 1;
      if (b.total !== a.total) return b.total - a.total;
      return a.sortOrder - b.sortOrder;
    });

    let rank = 0;
    let prevKey: string | null = null;
    for (let i = 0; i < rows.length; i++) {
      const timeKey = rows[i].finalTime ?? `pts:${rows[i].total}`;
      if (prevKey === null || timeKey !== prevKey) {
        rank = i + 1;
        prevKey = timeKey;
      }
      rows[i].rank = rank;
    }
  }

  void provas;
  return rows;
}
