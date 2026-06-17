import * as XLSX from "xlsx";
import type { ChallengerCrew, ChallengerPhase, ChallengerProva } from "./types";
import {
  CHALLENGER_IMPORT_SHEET,
  type Folha2ColMap,
  validateFolha2Modelo,
} from "./import-template";
import {
  excelSerialToClock,
  excelSerialToDuration,
  excelSerialToMinutes,
} from "./time-format";

export const STATION_KEYS = ["1.1", "1.2", "1.3", "1.4", "2", "3", "4"] as const;
export type StationKey = (typeof STATION_KEYS)[number];

export type ParsedStationScore = {
  key: StationKey;
  points: number | null;
  penalty: number | null;
};

export type ParsedCrewPhase = {
  startTime: string | null;
  endTime: string | null;
  grossTime: string | null;
  stations: ParsedStationScore[];
  penaltyPoints: number | null;
  penaltyTimeMin: number | null;
  finalTime: string | null;
  rank: number | null;
};

export type ParsedCrewRow = {
  crewName: string;
  crewId: string | null;
  provisional: ParsedCrewPhase;
  final: Pick<ParsedCrewPhase, "finalTime" | "rank"> & {
    trackTime: string | null;
    trackPenalty: string | null;
  };
  warnings: string[];
};

export type ImportParseResult = {
  rows: ParsedCrewRow[];
  warnings: string[];
  errors: string[];
};

function cell(row: unknown[], col: number): unknown {
  return row[col] ?? "";
}

function hasValue(value: unknown): boolean {
  return value !== "" && value != null;
}

function toNumber(value: unknown): number | null {
  if (!hasValue(value)) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toInt(value: unknown): number | null {
  const n = toNumber(value);
  if (n == null) return null;
  return Math.round(n);
}

function parseStationScores(row: unknown[], col: Folha2ColMap): ParsedStationScore[] {
  return STATION_KEYS.map((key, i) => ({
    key,
    points: toNumber(cell(row, col.stationPoints[i])),
    penalty: toNumber(cell(row, col.stationPenalties[i])),
  }));
}

function parseProvisionalPhase(row: unknown[], col: Folha2ColMap): ParsedCrewPhase {
  return {
    startTime: hasValue(cell(row, col.startTime))
      ? excelSerialToClock(cell(row, col.startTime))
      : null,
    endTime: hasValue(cell(row, col.endTime)) ? excelSerialToClock(cell(row, col.endTime)) : null,
    grossTime: hasValue(cell(row, col.grossTime))
      ? excelSerialToDuration(cell(row, col.grossTime))
      : null,
    stations: parseStationScores(row, col),
    penaltyPoints: toNumber(cell(row, col.penaltyPoints)),
    penaltyTimeMin: excelSerialToMinutes(cell(row, col.penaltyTimeMin)),
    finalTime: hasValue(cell(row, col.provFinalTime))
      ? excelSerialToDuration(cell(row, col.provFinalTime))
      : null,
    rank: toInt(cell(row, col.provRank)),
  };
}

function parseFinalPhase(row: unknown[], col: Folha2ColMap): ParsedCrewRow["final"] {
  return {
    trackTime: hasValue(cell(row, col.finalTrackTime))
      ? excelSerialToDuration(cell(row, col.finalTrackTime))
      : null,
    trackPenalty: hasValue(cell(row, col.finalTrackPenalty))
      ? String(cell(row, col.finalTrackPenalty))
      : null,
    finalTime: hasValue(cell(row, col.finalTime))
      ? excelSerialToDuration(cell(row, col.finalTime))
      : null,
    rank: toInt(cell(row, col.finalRank)),
  };
}

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

export function findCrewByName(crews: ChallengerCrew[], name: string): ChallengerCrew | null {
  const target = normalizeName(name);
  return crews.find((c) => normalizeName(c.name) === target) ?? null;
}

export function mapStationsToProvas(provas: ChallengerProva[]): Map<StationKey, string> {
  const sorted = [...provas].sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  const map = new Map<StationKey, string>();
  STATION_KEYS.forEach((key, i) => {
    if (sorted[i]) map.set(key, sorted[i].id);
  });
  return map;
}

export function parseChallengerExcel(buffer: Buffer): ImportParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    return { rows: [], warnings, errors: ["Ficheiro Excel inválido ou corrompido."] };
  }

  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() === CHALLENGER_IMPORT_SHEET) ??
    workbook.SheetNames.find((n) => n.toLowerCase().includes("folha2"));

  if (!sheetName) {
    return {
      rows: [],
      warnings,
      errors: ["Folha «Folha2» não encontrada. Use o modelo oficial de classificação."],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const validated = validateFolha2Modelo(grid);
  if ("errors" in validated) {
    return { rows: [], warnings, errors: validated.errors };
  }
  const layout = validated.layout;

  const rows: ParsedCrewRow[] = [];

  for (let i = layout.dataStartRow; i < grid.length; i++) {
    const row = grid[i];
    if (!Array.isArray(row)) continue;

    const crewName = String(cell(row, layout.col.crew)).trim();
    if (!crewName) continue;

    const provisional = parseProvisionalPhase(row, layout.col);
    const final = parseFinalPhase(row, layout.col);

    const hasAnyData =
      provisional.stations.some((s) => s.points != null || s.penalty != null) ||
      provisional.startTime != null ||
      provisional.finalTime != null ||
      provisional.rank != null ||
      final.trackTime != null ||
      final.finalTime != null ||
      final.rank != null;

    if (!hasAnyData) continue;

    rows.push({
      crewName,
      crewId: null,
      provisional,
      final,
      warnings: [],
    });
  }

  if (rows.length === 0) {
    errors.push(
      "Nenhuma equipa com dados encontrada na Folha2 (a partir da linha 5, coluna B).",
    );
  }

  return { rows, warnings, errors };
}

export type DraftScoreInput = {
  crew_id: string;
  prova_id: string | null;
  label: string;
  points: number;
  kind: "prova" | "penalty";
  phase: ChallengerPhase;
};

export type DraftCrewResultInput = {
  crew_id: string;
  phase: ChallengerPhase;
  start_time: string | null;
  end_time: string | null;
  gross_time: string | null;
  penalty_points: number | null;
  penalty_time_min: number | null;
  final_time: string | null;
  rank: number | null;
};

export function attachCrewIds(
  rows: ParsedCrewRow[],
  crews: ChallengerCrew[],
): { rows: ParsedCrewRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const updated = rows.map((row) => {
    const crew = findCrewByName(crews, row.crewName);
    if (!crew) {
      warnings.push(`Equipa «${row.crewName}» não encontrada nas guarnições inscritas.`);
      return row;
    }
    return { ...row, crewId: crew.id };
  });
  return { rows: updated, warnings };
}

function mergePhase(
  incoming: ParsedCrewPhase,
  existing: ParsedCrewPhase | undefined,
): ParsedCrewPhase {
  if (!existing) return incoming;
  return {
    startTime: incoming.startTime ?? existing.startTime,
    endTime: incoming.endTime ?? existing.endTime,
    grossTime: incoming.grossTime ?? existing.grossTime,
    penaltyPoints: incoming.penaltyPoints ?? existing.penaltyPoints,
    penaltyTimeMin: incoming.penaltyTimeMin ?? existing.penaltyTimeMin,
    finalTime: incoming.finalTime ?? existing.finalTime,
    rank: incoming.rank ?? existing.rank,
    stations: STATION_KEYS.map((key, i) => ({
      key,
      points: incoming.stations[i].points ?? existing.stations[i]?.points ?? null,
      penalty: incoming.stations[i].penalty ?? existing.stations[i]?.penalty ?? null,
    })),
  };
}

export function mergeImportRows(
  incoming: ParsedCrewRow[],
  existing: ParsedCrewRow[],
): ParsedCrewRow[] {
  const byName = new Map(existing.map((r) => [normalizeName(r.crewName), r]));

  for (const row of incoming) {
    const key = normalizeName(row.crewName);
    const prev = byName.get(key);
    if (!prev) {
      byName.set(key, row);
      continue;
    }
    byName.set(key, {
      ...row,
      crewId: row.crewId ?? prev.crewId,
      provisional: mergePhase(row.provisional, prev.provisional),
      final: {
        trackTime: row.final.trackTime ?? prev.final.trackTime,
        trackPenalty: row.final.trackPenalty ?? prev.final.trackPenalty,
        finalTime: row.final.finalTime ?? prev.final.finalTime,
        rank: row.final.rank ?? prev.final.rank,
      },
      warnings: [...prev.warnings, ...row.warnings],
    });
  }

  return [...byName.values()];
}

export function rowsToDraftData(
  rows: ParsedCrewRow[],
  provas: ChallengerProva[],
): { scores: DraftScoreInput[]; crewResults: DraftCrewResultInput[]; warnings: string[] } {
  const stationMap = mapStationsToProvas(provas);
  const warnings: string[] = [];
  const scores: DraftScoreInput[] = [];
  const crewResults: DraftCrewResultInput[] = [];

  if (stationMap.size < STATION_KEYS.length) {
    warnings.push(
      `Apenas ${stationMap.size} de ${STATION_KEYS.length} provas configuradas — alinhe a ordem das provas com as estações do Excel.`,
    );
  }

  for (const row of rows) {
    if (!row.crewId) continue;

    for (const station of row.provisional.stations) {
      const provaId = stationMap.get(station.key) ?? null;
      if (station.points != null) {
        scores.push({
          crew_id: row.crewId,
          prova_id: provaId,
          label: `Estação ${station.key}`,
          points: station.points,
          kind: "prova",
          phase: "provisional",
        });
      }
      if (station.penalty != null && station.penalty !== 0) {
        scores.push({
          crew_id: row.crewId,
          prova_id: provaId,
          label: `Pen. estação ${station.key}`,
          points: station.penalty,
          kind: "penalty",
          phase: "provisional",
        });
      }
    }

    crewResults.push({
      crew_id: row.crewId,
      phase: "provisional",
      start_time: row.provisional.startTime,
      end_time: row.provisional.endTime,
      gross_time: row.provisional.grossTime,
      penalty_points: row.provisional.penaltyPoints,
      penalty_time_min: row.provisional.penaltyTimeMin,
      final_time: row.provisional.finalTime,
      rank: row.provisional.rank,
    });

    const hasFinal =
      row.final.finalTime != null ||
      row.final.rank != null ||
      row.final.trackTime != null;

    if (hasFinal) {
      crewResults.push({
        crew_id: row.crewId,
        phase: "final",
        start_time: row.final.trackTime,
        end_time: null,
        gross_time: row.final.trackTime,
        penalty_points: row.final.trackPenalty ? Number(row.final.trackPenalty) || null : null,
        penalty_time_min: null,
        final_time: row.final.finalTime,
        rank: row.final.rank,
      });
    }
  }

  return { scores, crewResults, warnings };
}

/** Reconstrói linhas parseadas a partir do rascunho em BD (para merge incremental). */
export function parsedRowsFromDraft(
  crews: ChallengerCrew[],
  draftScores: { crew_id: string; prova_id: string | null; points: number; kind: string; phase: ChallengerPhase }[],
  draftResults: DraftCrewResultInput[],
  provas: ChallengerProva[],
): ParsedCrewRow[] {
  const stationMap = mapStationsToProvas(provas);
  const provaToStation = new Map<string, StationKey>();
  for (const [key, id] of stationMap) provaToStation.set(id, key);

  const crewById = new Map(crews.map((c) => [c.id, c]));
  const resultsByCrew = new Map<string, { provisional?: DraftCrewResultInput; final?: DraftCrewResultInput }>();

  for (const r of draftResults) {
    const entry = resultsByCrew.get(r.crew_id) ?? {};
    if (r.phase === "provisional") entry.provisional = r;
    else entry.final = r;
    resultsByCrew.set(r.crew_id, entry);
  }

  const scoresByCrew = new Map<string, typeof draftScores>();
  for (const s of draftScores) {
    const list = scoresByCrew.get(s.crew_id) ?? [];
    list.push(s);
    scoresByCrew.set(s.crew_id, list);
  }

  const rows: ParsedCrewRow[] = [];

  for (const [crewId, results] of resultsByCrew) {
    const crew = crewById.get(crewId);
    if (!crew) continue;

    const crewScores = scoresByCrew.get(crewId) ?? [];
    const stations: ParsedStationScore[] = STATION_KEYS.map((key) => ({
      key,
      points: null,
      penalty: null,
    }));

    for (const score of crewScores.filter((s) => s.phase === "provisional")) {
      if (!score.prova_id) continue;
      const stationKey = provaToStation.get(score.prova_id);
      if (!stationKey) continue;
      const idx = STATION_KEYS.indexOf(stationKey);
      if (idx < 0) continue;
      if (score.kind === "prova") stations[idx].points = score.points;
      if (score.kind === "penalty") stations[idx].penalty = score.points;
    }

    const prov = results.provisional;
    const fin = results.final;

    rows.push({
      crewName: crew.name,
      crewId,
      provisional: {
        startTime: prov?.start_time ?? null,
        endTime: prov?.end_time ?? null,
        grossTime: prov?.gross_time ?? null,
        stations,
        penaltyPoints: prov?.penalty_points ?? null,
        penaltyTimeMin: prov?.penalty_time_min ?? null,
        finalTime: prov?.final_time ?? null,
        rank: prov?.rank ?? null,
      },
      final: {
        trackTime: fin?.start_time ?? fin?.gross_time ?? null,
        trackPenalty: fin?.penalty_points != null ? String(fin.penalty_points) : null,
        finalTime: fin?.final_time ?? null,
        rank: fin?.rank ?? null,
      },
      warnings: [],
    });
  }

  return rows;
}
