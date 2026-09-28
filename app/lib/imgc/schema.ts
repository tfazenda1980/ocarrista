import { getSql } from "../db/client";

let schemaReady: boolean | null = null;

export async function ensureImgcSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_editions (
      year TEXT PRIMARY KEY,
      about_title TEXT,
      about_body TEXT,
      barracks_title TEXT,
      barracks_body TEXT,
      practical_title TEXT,
      practical_body TEXT,
      programme_title TEXT,
      programme_body TEXT,
      organizer TEXT,
      email TEXT,
      phone TEXT,
      notes TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_assets (
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
  await sql`CREATE INDEX IF NOT EXISTS idx_imgc_assets_year ON imgc_assets (year, slot)`;

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_delegations (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      host BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_imgc_delegations_year ON imgc_delegations (year, sort_order)`;

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_links (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('tomar', 'transport', 'stay', 'other')),
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_imgc_links_year ON imgc_links (year, sort_order)`;

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_gallery (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_imgc_gallery_year ON imgc_gallery (year, sort_order)`;

  await sql`
    CREATE TABLE IF NOT EXISTS imgc_messages (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_imgc_messages_year ON imgc_messages (year, created_at DESC)`;

  schemaReady = true;
}
