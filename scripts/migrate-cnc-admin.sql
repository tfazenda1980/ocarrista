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
  regulation_title TEXT,
  regulation_body TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cnc_editions ADD COLUMN IF NOT EXISTS regulation_title TEXT;
ALTER TABLE cnc_editions ADD COLUMN IF NOT EXISTS regulation_body TEXT;

CREATE TABLE IF NOT EXISTS cnc_disciplines (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'resources' CHECK (kind IN ('resources', 'gallery', 'grouped', 'resultados')),
  parent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cnc_disciplines ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE cnc_disciplines DROP CONSTRAINT IF EXISTS cnc_disciplines_kind_check;
ALTER TABLE cnc_disciplines
  ADD CONSTRAINT cnc_disciplines_kind_check
  CHECK (kind IN ('resources', 'gallery', 'grouped', 'resultados'));

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

CREATE TABLE IF NOT EXISTS cnc_sponsors (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_sponsors_year ON cnc_sponsors (year, sort_order);

CREATE TABLE IF NOT EXISTS cnc_messages (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'prova', 'suggestion')),
  prova_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_messages_year ON cnc_messages (year, created_at DESC);

CREATE TABLE IF NOT EXISTS cnc_notices (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_notices_year ON cnc_notices (year, created_at DESC);

CREATE TABLE IF NOT EXISTS cnc_gallery (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnc_gallery_year ON cnc_gallery (year, sort_order);
