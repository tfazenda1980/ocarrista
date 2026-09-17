-- CNC — conteúdos e documentos geridos pelo admin
-- As tabelas também são criadas automaticamente na primeira utilização.

CREATE TABLE IF NOT EXISTS cnc_editions (
  year TEXT PRIMARY KEY,
  opening_note_title TEXT,
  opening_note_body TEXT,
  general_program_title TEXT,
  general_program_body TEXT,
  organizer TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cnc_disciplines (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'resources' CHECK (kind IN ('resources', 'gallery')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_disciplines_year ON cnc_disciplines (year, sort_order);

CREATE TABLE IF NOT EXISTS cnc_useful_info (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_useful_year ON cnc_useful_info (year, sort_order);

CREATE TABLE IF NOT EXISTS cnc_assets (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  slot TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  url TEXT,
  mime TEXT,
  filename TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year, slot)
);

CREATE INDEX IF NOT EXISTS idx_cnc_assets_year ON cnc_assets (year, slot);
