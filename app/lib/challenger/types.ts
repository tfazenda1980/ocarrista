export type ChallengerPhase = "provisional" | "final";

export type ChallengerScoreKind = "prova" | "penalty" | "bonus";

export type ChallengerSettings = {
  year: string;
  provisional_visible: boolean;
  final_visible: boolean;
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
  penalties: number;
  bonuses: number;
};

export type ChallengerLiveData = {
  configured: boolean;
  settings: ChallengerSettings | null;
  provas: ChallengerProva[];
  crews: ChallengerCrew[];
  provisional: ChallengerStanding[];
  final: ChallengerStanding[];
};
