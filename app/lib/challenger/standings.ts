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
    const isFinal = phase === "final";

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
      penaltyPoints: isFinal ? null : (result?.penalty_points ?? null),
      penaltyTimeMin: isFinal ? null : (result?.penalty_time_min ?? null),
      provisionalFinalTime: isFinal ? null : (result?.final_time ?? null),
      trackTime: isFinal ? (result?.gross_time ?? result?.start_time ?? null) : null,
      trackPenalty:
        isFinal && result?.penalty_points != null && !Number.isNaN(Number(result.penalty_points))
          ? Number(result.penalty_points)
          : null,
      challengerFinalTime: isFinal ? (result?.final_time ?? null) : null,
      finalTime: isFinal ? (result?.final_time ?? null) : (result?.final_time ?? null),
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

/** Tabela unificada: provas (provisional) + pista + tempo final do Challenger. */
export function computeDisplayStandings(
  crews: ChallengerCrew[],
  provas: ChallengerProva[],
  scores: ChallengerScore[],
  crewResults: ChallengerCrewResult[],
): ChallengerStanding[] {
  const activeCrews = crews.filter((c) => c.active);
  const provScores = scores.filter((s) => s.phase === "provisional");
  const provResults = new Map(
    crewResults.filter((r) => r.phase === "provisional").map((r) => [r.crew_id, r]),
  );
  const finalResults = new Map(
    crewResults.filter((r) => r.phase === "final").map((r) => [r.crew_id, r]),
  );

  const rows: ChallengerStanding[] = activeCrews.map((crew) => {
    const crewScores = provScores.filter((s) => s.crew_id === crew.id);
    const provaPoints: Record<string, number> = {};
    const provaPenalties: Record<string, number> = {};
    let stationPenalties = 0;
    let bonuses = 0;

    for (const score of crewScores) {
      const pts = Number(score.points);
      if (score.kind === "prova" && score.prova_id) {
        provaPoints[score.prova_id] = (provaPoints[score.prova_id] ?? 0) + pts;
      } else if (score.kind === "penalty") {
        if (score.prova_id) {
          provaPenalties[score.prova_id] = (provaPenalties[score.prova_id] ?? 0) + pts;
        }
        stationPenalties += pts;
      } else if (score.kind === "bonus") {
        bonuses += pts;
      }
    }

    const provaTotal = Object.values(provaPoints).reduce((a, b) => a + b, 0);
    const prov = provResults.get(crew.id);
    const fin = finalResults.get(crew.id);
    const challengerFinalTime = fin?.final_time ?? null;
    const provisionalFinalTime = prov?.final_time ?? null;

    return {
      crewId: crew.id,
      crewName: crew.name,
      sortOrder: crew.sort_order,
      total: provaTotal + stationPenalties + bonuses,
      rank: 0,
      provaPoints,
      provaPenalties,
      penalties: stationPenalties,
      bonuses,
      startTime: prov?.start_time ?? null,
      endTime: prov?.end_time ?? null,
      grossTime: prov?.gross_time ?? null,
      penaltyPoints: prov?.penalty_points ?? null,
      penaltyTimeMin: prov?.penalty_time_min ?? null,
      provisionalFinalTime,
      trackTime: fin?.gross_time ?? fin?.start_time ?? null,
      trackPenalty:
        fin?.penalty_points != null && !Number.isNaN(Number(fin.penalty_points))
          ? Number(fin.penalty_points)
          : null,
      challengerFinalTime,
      finalTime: challengerFinalTime ?? provisionalFinalTime,
    };
  });

  const hasChallengerTimes = rows.some((r) => r.challengerFinalTime);

  rows.sort((a, b) => {
    const ta = parseTimeToSeconds(
      hasChallengerTimes ? a.challengerFinalTime : a.provisionalFinalTime,
    );
    const tb = parseTimeToSeconds(
      hasChallengerTimes ? b.challengerFinalTime : b.provisionalFinalTime,
    );
    if (ta != null && tb != null && ta !== tb) return ta - tb;
    if (ta != null && tb == null) return -1;
    if (ta == null && tb != null) return 1;
    return a.sortOrder - b.sortOrder;
  });

  let rank = 0;
  let prevKey: string | null = null;
  for (let i = 0; i < rows.length; i++) {
    const key =
      (hasChallengerTimes ? rows[i].challengerFinalTime : rows[i].provisionalFinalTime) ??
      `crew:${rows[i].crewId}`;
    if (prevKey === null || key !== prevKey) {
      rank = i + 1;
      prevKey = key;
    }
    rows[i].rank = rank;
  }

  void provas;
  return rows.filter(
    (row) =>
      Object.keys(row.provaPoints).length > 0 ||
      row.provisionalFinalTime != null ||
      row.challengerFinalTime != null ||
      row.trackTime != null,
  );
}
