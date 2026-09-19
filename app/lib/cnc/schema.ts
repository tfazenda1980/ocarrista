import { getSql } from "../db/client";

let schemaReady: boolean | null = null;

/** Garante tabelas do CNC (idempotente). */
export async function ensureCncSchema(): Promise<void> {
  if (schemaReady) return;

  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cnc_disciplines (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      kind TEXT NOT NULL DEFAULT 'resources'
        CHECK (kind IN ('resources', 'gallery')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_cnc_disciplines_year
      ON cnc_disciplines (year, sort_order)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cnc_useful_info (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_cnc_useful_year
      ON cnc_useful_info (year, sort_order)
  `;

  await sql`
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
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_cnc_assets_year
      ON cnc_assets (year, slot)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cnc_sponsors (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_cnc_sponsors_year
      ON cnc_sponsors (year, sort_order)
  `;

  schemaReady = true;
}
