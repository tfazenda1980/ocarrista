-- Challenger O Carrista — provas, guarnições e classificação
-- Executar no Neon SQL Editor após init-db.sql

CREATE TABLE IF NOT EXISTS challenger_settings (
  year TEXT PRIMARY KEY,
  provisional_visible BOOLEAN NOT NULL DEFAULT true,
  final_visible BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenger_provas (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  sketch_url TEXT,
  sketch_label TEXT,
  sketch_mime TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenger_provas_year ON challenger_provas (year, sort_order);

CREATE TABLE IF NOT EXISTS challenger_crews (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenger_crews_year ON challenger_crews (year, sort_order);

CREATE TABLE IF NOT EXISTS challenger_crew_members (
  id TEXT PRIMARY KEY,
  crew_id TEXT NOT NULL REFERENCES challenger_crews (id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position >= 1 AND position <= 4),
  name TEXT NOT NULL,
  role TEXT,
  UNIQUE (crew_id, position)
);

CREATE TABLE IF NOT EXISTS challenger_scores (
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

CREATE INDEX IF NOT EXISTS idx_challenger_scores_year_phase ON challenger_scores (year, phase);
CREATE INDEX IF NOT EXISTS idx_challenger_scores_crew ON challenger_scores (crew_id);

INSERT INTO challenger_settings (year, provisional_visible, final_visible)
VALUES ('2026', true, false)
ON CONFLICT (year) DO NOTHING;
