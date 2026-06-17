export type ChallengerPhase = "provisional" | "final";

export type ChallengerScoreKind = "prova" | "penalty" | "bonus";

export type ChallengerSettings = {
  year: string;
  provisional_visible: boolean;
  final_visible: boolean;
  draft_imported_at: string | null;
  draft_filename: string | null;
  provisional_published_at: string | null;
  final_published_at: string | null;
  updated_at: string;
};

export type ChallengerCrewResult = {
  year: string;
  crew_id: string;
  phase: ChallengerPhase;
  start_time: string | null;
  end_time: string | null;
  gross_time: string | null;
  penalty_points: number | null;
  penalty_time_min: number | null;
  final_time: string | null;
  rank: number | null;
  updated_at: string;
};

export type ChallengerProva = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  sort_order: number;
  sketch_url: string | null;
  sketch_label: string | null;
  sketch_mime: string | null;
  created_at: string;
  updated_at: string;
};

export type ChallengerCrewMember = {
  id: string;
  crew_id: string;
  position: number;
  name: string;
  role: string | null;
};

export type ChallengerCrew = {
  id: string;
  year: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  members: ChallengerCrewMember[];
};

export type ChallengerScore = {
  id: string;
  year: string;
  crew_id: string;
  prova_id: string | null;
  label: string;
  points: number;
  kind: ChallengerScoreKind;
  phase: ChallengerPhase;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ChallengerStanding = {
  crewId: string;
  crewName: string;
  sortOrder: number;
  total: number;
  rank: number;
  provaPoints: Record<string, number>;
  provaPenalties: Record<string, number>;
  penalties: number;
  bonuses: number;
  startTime: string | null;
  endTime: string | null;
  grossTime: string | null;
  /** Pontos penalização (classificação provisória). */
  penaltyPoints: number | null;
  penaltyTimeMin: number | null;
  /** Tempo final das provas (classificação provisória). */
  provisionalFinalTime: string | null;
  /** Tempo na pista Carrista (col. X). */
  trackTime: string | null;
  /** Penalização na pista (col. Y). */
  trackPenalty: number | null;
  /** Tempo total do Challenger — ordenação final (col. Z). */
  challengerFinalTime: string | null;
  /** Compat: tempo final relevante para ordenação / legado. */
  finalTime: string | null;
};

export type ChallengerImportMeta = {
  importedAt: string | null;
  filename: string | null;
  provisionalPublishedAt: string | null;
  finalPublishedAt: string | null;
};

export type ChallengerLiveData = {
  configured: boolean;
  settings: ChallengerSettings | null;
  provas: ChallengerProva[];
  crews: ChallengerCrew[];
  /** Tabela unificada para o site (provas + provisória + pista + final). */
  classification: ChallengerStanding[];
  /** @deprecated Usar `classification`. Mantido para publicação por fase. */
  provisional: ChallengerStanding[];
  /** @deprecated Usar `classification`. */
  final: ChallengerStanding[];
  draftClassification?: ChallengerStanding[];
  draftProvisional?: ChallengerStanding[];
  draftFinal?: ChallengerStanding[];
  importMeta?: ChallengerImportMeta;
};
