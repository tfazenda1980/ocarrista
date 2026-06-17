import * as XLSX from "xlsx";
import type { ChallengerCrew, ChallengerPhase, ChallengerProva } from "./types";
import { excelSerialToClock, excelSerialToDuration, formatMinutes } from "./time-format";

export const STATION_KEYS = ["1.1", "1.2", "1.3", "1.4", "2", "3", "4"] as const;
export type StationKey = (typeof STATION_KEYS)[number];

/** Deslocamentos relativos à coluna «Equipa» na Folha2. */
const CREW_COL_OFFSETS = {
  start: 1,
  end: 2,
  gross: 3,
  stationPoints: [4, 6, 8, 10, 12, 14, 16],
  stationPenalties: [5, 7, 9, 11, 13, 15, 17],
  penaltyPoints: 18,
  penaltyTimeMin: 19,
  provFinalTime: 20,
  provRank: 21,
  finalTempo: 22,
  finalPenalty: 23,
  finalTime: 24,
  finalRank: 25,
} as const;

const DEFAULT_DATA_START_ROW = 4;
const DEFAULT_COL_CREW = 0;

type Folha2Layout = {
  dataStartRow: number;
  colCrew: number;
};

function colAt(layout: Folha2Layout, offset: number): number {
  return layout.colCrew + offset;
}

function detectFolha2Layout(grid: unknown[][]): Folha2Layout {
  for (let r = 0; r < Math.min(15, grid.length); r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const label = String(row[c] ?? "")
        .trim()
        .toLowerCase();
      if (label.startsWith("equipa")) {
        return { dataStartRow: r + 1, colCrew: c };
      }
    }
  }
  return { dataStartRow: DEFAULT_DATA_START_ROW, colCrew: DEFAULT_COL_CREW };
}

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

function parseStationScores(row: unknown[], layout: Folha2Layout): ParsedStationScore[] {
  return STATION_KEYS.map((key, i) => ({
    key,
    points: toNumber(cell(row, colAt(layout, CREW_COL_OFFSETS.stationPoints[i]))),
    penalty: toNumber(cell(row, colAt(layout, CREW_COL_OFFSETS.stationPenalties[i]))),
  }));
}

function parseProvisionalPhase(row: unknown[], layout: Folha2Layout): ParsedCrewPhase {
  return {
    startTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.start)))
      ? excelSerialToClock(cell(row, colAt(layout, CREW_COL_OFFSETS.start)))
      : null,
    endTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.end)))
      ? excelSerialToClock(cell(row, colAt(layout, CREW_COL_OFFSETS.end)))
      : null,
    grossTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.gross)))
      ? excelSerialToDuration(cell(row, colAt(layout, CREW_COL_OFFSETS.gross)))
      : null,
    stations: parseStationScores(row, layout),
    penaltyPoints: toNumber(cell(row, colAt(layout, CREW_COL_OFFSETS.penaltyPoints))),
    penaltyTimeMin: formatMinutes(cell(row, colAt(layout, CREW_COL_OFFSETS.penaltyTimeMin))),
    finalTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.provFinalTime)))
      ? excelSerialToDuration(cell(row, colAt(layout, CREW_COL_OFFSETS.provFinalTime)))
      : null,
    rank: toInt(cell(row, colAt(layout, CREW_COL_OFFSETS.provRank))),
  };
}

function parseFinalPhase(row: unknown[], layout: Folha2Layout): ParsedCrewRow["final"] {
  return {
    trackTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.finalTempo)))
      ? excelSerialToDuration(cell(row, colAt(layout, CREW_COL_OFFSETS.finalTempo)))
      : null,
    trackPenalty: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.finalPenalty)))
      ? String(cell(row, colAt(layout, CREW_COL_OFFSETS.finalPenalty)))
      : null,
    finalTime: hasValue(cell(row, colAt(layout, CREW_COL_OFFSETS.finalTime)))
      ? excelSerialToDuration(cell(row, colAt(layout, CREW_COL_OFFSETS.finalTime)))
      : null,
    rank: toInt(cell(row, colAt(layout, CREW_COL_OFFSETS.finalRank))),
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
    workbook.SheetNames.find((n) => n.toLowerCase() === "folha2") ??
    workbook.SheetNames[1] ??
    workbook.SheetNames[0];

  if (!sheetName) {
    return { rows: [], warnings, errors: ["O ficheiro não contém folhas."] };
  }

  const sheet = workbook.Sheets[sheetName];
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const layout = detectFolha2Layout(grid);

  const rows: ParsedCrewRow[] = [];

  for (let i = layout.dataStartRow; i < grid.length; i++) {
    const row = grid[i];
    if (!Array.isArray(row)) continue;

    const crewName = String(cell(row, layout.colCrew)).trim();
    if (!crewName) continue;

    const provisional = parseProvisionalPhase(row, layout);
    const final = parseFinalPhase(row, layout);

    const hasAnyData =
      provisional.stations.some((s) => s.points != null || s.penalty != null) ||
      provisional.finalTime != null ||
      provisional.rank != null ||
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
    errors.push("Nenhuma equipa com dados encontrada na Folha2 (a partir da linha 5).");
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
