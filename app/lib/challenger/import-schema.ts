import { getSql } from "../db/client";

let importSchemaReady: boolean | null = null;

/** Garante tabelas/colunas do import Excel (idempotente). */
export async function ensureChallengerImportSchema(): Promise<void> {
  if (importSchemaReady) return;

  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  await sql`
    ALTER TABLE challenger_settings
      ADD COLUMN IF NOT EXISTS draft_imported_at TIMESTAMPTZ
  `;
  await sql`
    ALTER TABLE challenger_settings
      ADD COLUMN IF NOT EXISTS draft_filename TEXT
  `;
  await sql`
    ALTER TABLE challenger_settings
      ADD COLUMN IF NOT EXISTS provisional_published_at TIMESTAMPTZ
  `;
  await sql`
    ALTER TABLE challenger_settings
      ADD COLUMN IF NOT EXISTS final_published_at TIMESTAMPTZ
  `;

  await sql`
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
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_challenger_crew_results_year
      ON challenger_crew_results (year, phase)
  `;

  await sql`
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
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_challenger_crew_results_draft_year
      ON challenger_crew_results_draft (year, phase)
  `;

  await sql`
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
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_challenger_scores_draft_year
      ON challenger_scores_draft (year, phase)
  `;

  importSchemaReady = true;
}
