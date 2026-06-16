-- Challenger — import Excel (rascunho + tempos publicados)
-- Executar no Neon após migrate-challenger.sql

ALTER TABLE challenger_settings
  ADD COLUMN IF NOT EXISTS draft_imported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS draft_filename TEXT,
  ADD COLUMN IF NOT EXISTS provisional_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS final_published_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS challenger_crew_results (
  year TEXT NOT NULL,
  crew_id TEXT NOT NULL REFERENCES challenger_crews (id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('provisional', 'final')),
  start_time TEXT,
  end_time TEXT,
  gross_time TEXT,
  penalty_points NUMERIC(10, 2),
  penalty_time_min NUMERIC(10, 4),
  final_time TEXT,
  rank INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (year, crew_id, phase)
);

CREATE INDEX IF NOT EXISTS idx_challenger_crew_results_year
  ON challenger_crew_results (year, phase);

CREATE TABLE IF NOT EXISTS challenger_crew_results_draft (
  year TEXT NOT NULL,
  crew_id TEXT NOT NULL REFERENCES challenger_crews (id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('provisional', 'final')),
  start_time TEXT,
  end_time TEXT,
  gross_time TEXT,
  penalty_points NUMERIC(10, 2),
  penalty_time_min NUMERIC(10, 4),
  final_time TEXT,
  rank INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (year, crew_id, phase)
);

CREATE INDEX IF NOT EXISTS idx_challenger_crew_results_draft_year
  ON challenger_crew_results_draft (year, phase);

CREATE TABLE IF NOT EXISTS challenger_scores_draft (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  crew_id TEXT NOT NULL REFERENCES challenger_crews (id) ON DELETE CASCADE,
  prova_id TEXT REFERENCES challenger_provas (id) ON DELETE SET NULL,
  label TEXT NOT NULL DEFAULT '',
  points NUMERIC(10, 2) NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'prova' CHECK (kind IN ('prova', 'penalty', 'bonus')),
  phase TEXT NOT NULL DEFAULT 'provisional' CHECK (phase IN ('provisional', 'final')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenger_scores_draft_year
  ON challenger_scores_draft (year, phase);
