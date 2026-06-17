/**
 * Modelo oficial de importação — Folha2 do Excel «Classificação».
 * Referência: `public/challenger/classificacao-modelo.xlsx` (Classificação-1.xlsx).
 *
 * Layout:
 * - Folha «Folha2»
 * - Coluna A vazia; dados a partir da coluna B
 * - Linhas 1–3: títulos de secção
 * - Linha 4: cabeçalhos de coluna
 * - Linha 5+: uma equipa por linha
 */
export const CHALLENGER_IMPORT_SHEET = "folha2";

export const FOLHA2_MODEL_PATH = "/challenger/classificacao-modelo.xlsx";

/** Cabeçalho de colunas (índice 0 = linha 4 no Excel). */
export const FOLHA2_HEADER_ROW = 3;

/** Primeira linha de equipas (índice 0 = linha 5 no Excel). */
export const FOLHA2_DATA_START_ROW = 4;

/** Índices de coluna 0-based do modelo (coluna A = 0, sempre vazia). */
export const FOLHA2_COL = {
  crew: 1,
  startTime: 2,
  endTime: 3,
  grossTime: 4,
  stationPoints: [5, 7, 9, 11, 13, 15, 17] as const,
  stationPenalties: [6, 8, 10, 12, 14, 16, 18] as const,
  penaltyPoints: 19,
  penaltyTimeMin: 20,
  provFinalTime: 21,
  provRank: 22,
  finalTrackTime: 23,
  finalTrackPenalty: 24,
  finalTime: 25,
  finalRank: 26,
} as const;

export type Folha2ColMap = typeof FOLHA2_COL;

export type Folha2Layout = {
  dataStartRow: number;
  col: Folha2ColMap;
};

type HeaderCheck = { col: number; describe: string; match: (label: string) => boolean };

function normHeader(label: unknown): string {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

const FOLHA2_HEADER_CHECKS: HeaderCheck[] = [
  { col: FOLHA2_COL.crew, describe: "Equipa", match: (l) => l.startsWith("equipa") },
  { col: FOLHA2_COL.startTime, describe: "Hora de início", match: (l) => l.includes("inicio") },
  { col: FOLHA2_COL.grossTime, describe: "Tempo total de prova", match: (l) => l.includes("tempo total") },
  {
    col: FOLHA2_COL.penaltyPoints,
    describe: "Pontos penalização",
    match: (l) => l.includes("pontos penaliza"),
  },
  {
    col: FOLHA2_COL.penaltyTimeMin,
    describe: "Tempo de penalização (minutos)",
    match: (l) => l.includes("penaliza") && l.includes("minut"),
  },
  {
    col: FOLHA2_COL.provFinalTime,
    describe: "Tempo final de prova (provisória)",
    match: (l) => l.includes("tempo final") && l.includes("prova"),
  },
  {
    col: FOLHA2_COL.provRank,
    describe: "Classificação provisória",
    match: (l) => l.includes("classific"),
  },
  { col: FOLHA2_COL.finalTrackTime, describe: "Tempo (pista)", match: (l) => l.startsWith("tempo") },
  {
    col: FOLHA2_COL.finalTrackPenalty,
    describe: "Penalização (pista)",
    match: (l) => l.includes("penaliza"),
  },
  {
    col: FOLHA2_COL.finalTime,
    describe: "Tempo final de prova (final)",
    match: (l) => l.includes("tempo final") && l.includes("prova"),
  },
  {
    col: FOLHA2_COL.finalRank,
    describe: "Classificação final",
    match: (l) => l.includes("classificacao final"),
  },
];

export function validateFolha2Modelo(grid: unknown[][]): { layout: Folha2Layout } | { errors: string[] } {
  const header = grid[FOLHA2_HEADER_ROW];
  if (!Array.isArray(header)) {
    return {
      errors: [
        "Cabeçalho da Folha2 não encontrado na linha 4.",
        "Use o modelo oficial (coluna A vazia, cabeçalhos na linha 4, dados a partir da linha 5).",
      ],
    };
  }

  const errors: string[] = [];
  for (const check of FOLHA2_HEADER_CHECKS) {
    const label = normHeader(header[check.col]);
    if (!check.match(label)) {
      errors.push(
        `Coluna ${excelColumnName(check.col)} / linha 4: esperado «${check.describe}»${label ? `, encontrado «${label}»` : ", célula vazia"}.`,
      );
    }
  }

  if (errors.length > 0) {
    return {
      errors: [
        "O ficheiro não corresponde ao modelo de classificação do Challenger.",
        `Descarregue o modelo em ${FOLHA2_MODEL_PATH}.`,
        ...errors,
      ],
    };
  }

  return {
    layout: {
      dataStartRow: FOLHA2_DATA_START_ROW,
      col: FOLHA2_COL,
    },
  };
}

function excelColumnName(index: number): string {
  let n = index + 1;
  let name = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}
