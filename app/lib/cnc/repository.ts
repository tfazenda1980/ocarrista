import { getSql, dbConfigured } from "../db/client";
import { getCncEdition } from "../events/load-cnc";
import type {
  CncDiscipline,
  CncEventData,
  CncUsefulInfoItem,
} from "../events/cnc-types";
import { ensureCncSchema } from "./schema";
import type { CncAsset, CncDisciplineKind } from "./slots";
import {
  disciplineSlot,
  emptyResource,
  generalProgramSlot,
  openingNoteSlot,
  slugifyId,
  usefulSlot,
} from "./slots";

type EditionRow = {
  year: string;
  opening_note_title: string | null;
  opening_note_body: string | null;
  general_program_title: string | null;
  general_program_body: string | null;
  organizer: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type DisciplineRow = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  sort_order: number;
  kind: CncDisciplineKind;
};

type UsefulRow = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  sort_order: number;
};

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function sqlClient() {
  await ensureCncSchema();
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  return sql;
}

export async function seedCncYear(year: string): Promise<void> {
  const base = getCncEdition(year);
  if (!base) return;
  const sql = await sqlClient();

  const existing = await sql`SELECT year FROM cnc_editions WHERE year = ${year} LIMIT 1`;
  if (existing.length > 0) return;

  await sql`
    INSERT INTO cnc_editions (
      year, opening_note_title, opening_note_body,
      general_program_title, general_program_body,
      organizer, email, phone, notes
    )
    VALUES (
      ${year},
      ${base.openingNote.title},
      ${base.openingNote.body},
      ${base.generalProgram.title},
      ${base.generalProgram.body},
      ${base.contacts.organizer},
      ${base.contacts.email},
      ${base.contacts.phone ?? ""},
      ${base.contacts.notes ?? ""}
    )
  `;

  for (const [index, discipline] of base.disciplines.entries()) {
    await sql`
      INSERT INTO cnc_disciplines (id, year, title, description, sort_order, kind)
      VALUES (
        ${discipline.id},
        ${year},
        ${discipline.title},
        ${discipline.description ?? null},
        ${index},
        ${discipline.galleryPdf ? "gallery" : "resources"}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const [index, item] of base.usefulInfo.entries()) {
    await sql`
      INSERT INTO cnc_useful_info (id, year, title, description, sort_order)
      VALUES (
        ${item.id},
        ${year},
        ${item.title},
        ${item.description ?? null},
        ${index}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function listAssets(year: string): Promise<CncAsset[]> {
  const sql = await sqlClient();
  const rows = await sql`
    SELECT id, year, slot, label, url, mime, filename
    FROM cnc_assets
    WHERE year = ${year}
  `;
  return rows as CncAsset[];
}

function assetMap(assets: CncAsset[]): Map<string, CncAsset> {
  return new Map(assets.map((a) => [a.slot, a]));
}

function disciplineFromRow(
  row: DisciplineRow,
  assets: Map<string, CncAsset>,
  fallback?: CncDiscipline,
): CncDiscipline {
  if (row.kind === "gallery") {
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      galleryPdf: emptyResource(
        fallback?.galleryPdf?.label ?? "Galeria de Prémios (PDF)",
        assets.get(disciplineSlot(row.id, "gallery")),
        fallback?.galleryPdf,
      ),
    };
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    resources: {
      ordens: emptyResource(
        "Ordens de Entrada",
        assets.get(disciplineSlot(row.id, "ordens")),
        fallback?.resources?.ordens,
      ),
      croquis: emptyResource(
        "Croquis",
        assets.get(disciplineSlot(row.id, "croquis")),
        fallback?.resources?.croquis,
      ),
      resultados: emptyResource(
        "Resultados",
        assets.get(disciplineSlot(row.id, "resultados")),
        fallback?.resources?.resultados,
      ),
    },
  };
}

function usefulFromRow(
  row: UsefulRow,
  assets: Map<string, CncAsset>,
  fallback?: CncUsefulInfoItem,
): CncUsefulInfoItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    pdf: emptyResource(
      fallback?.pdf.label ?? `${row.title} (PDF)`,
      assets.get(usefulSlot(row.id)),
      fallback?.pdf,
    ),
  };
}

export async function getCncLiveEdition(
  year: string,
  options?: { strict?: boolean },
): Promise<CncEventData | null> {
  const base = getCncEdition(year);
  if (!base) return null;
  if (!dbConfigured()) {
    if (options?.strict) throw new Error("DATABASE_URL em falta");
    return base;
  }

  try {
    await seedCncYear(year);
    const sql = await sqlClient();
    const [editionRows, disciplineRows, usefulRows, assets] = await Promise.all([
      sql`
        SELECT year, opening_note_title, opening_note_body,
               general_program_title, general_program_body,
               organizer, email, phone, notes
        FROM cnc_editions
        WHERE year = ${year}
        LIMIT 1
      `,
      sql`
        SELECT id, year, title, description, sort_order, kind
        FROM cnc_disciplines
        WHERE year = ${year}
        ORDER BY sort_order ASC, title ASC
      `,
      sql`
        SELECT id, year, title, description, sort_order
        FROM cnc_useful_info
        WHERE year = ${year}
        ORDER BY sort_order ASC, title ASC
      `,
      listAssets(year),
    ]);

    const edition = (editionRows[0] as EditionRow | undefined) ?? null;
    const assetsBySlot = assetMap(assets);
    const fallbackDiscipline = new Map(base.disciplines.map((d) => [d.id, d]));
    const fallbackUseful = new Map(base.usefulInfo.map((item) => [item.id, item]));
    const disciplines = (disciplineRows as DisciplineRow[]).map((row) =>
      disciplineFromRow(
        { ...row, sort_order: asNumber(row.sort_order), kind: row.kind },
        assetsBySlot,
        fallbackDiscipline.get(row.id),
      ),
    );
    const usefulInfo = (usefulRows as UsefulRow[]).map((row) =>
      usefulFromRow(
        { ...row, sort_order: asNumber(row.sort_order) },
        assetsBySlot,
        fallbackUseful.get(row.id),
      ),
    );

    return {
      ...base,
      openingNote: {
        title: edition?.opening_note_title || base.openingNote.title,
        body: edition?.opening_note_body || base.openingNote.body,
        pdf: emptyResource(
          base.openingNote.pdf?.label ?? "Nota de Abertura (PDF)",
          assetsBySlot.get(openingNoteSlot()),
          base.openingNote.pdf,
        ),
      },
      generalProgram: {
        title: edition?.general_program_title || base.generalProgram.title,
        body: edition?.general_program_body || base.generalProgram.body,
        pdf: emptyResource(
          base.generalProgram.pdf?.label ?? "Programa geral (PDF)",
          assetsBySlot.get(generalProgramSlot()),
          base.generalProgram.pdf,
        ),
      },
      disciplines: disciplines.length > 0 ? disciplines : base.disciplines,
      usefulInfo: usefulInfo.length > 0 ? usefulInfo : base.usefulInfo,
      contacts: {
        organizer: edition?.organizer || base.contacts.organizer,
        email: edition?.email || base.contacts.email,
        phone: edition?.phone ?? base.contacts.phone,
        notes: edition?.notes ?? base.contacts.notes,
      },
    };
  } catch (err) {
    console.error("[cnc] getCncLiveEdition", err);
    if (options?.strict) throw err;
    return base;
  }
}

export async function updateCncContent(
  year: string,
  fields: {
    opening_note_title?: string;
    opening_note_body?: string;
    general_program_title?: string;
    general_program_body?: string;
    organizer?: string;
    email?: string;
    phone?: string;
    notes?: string;
  },
): Promise<void> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const current = await getCncLiveEdition(year);
  if (!current) throw new Error("Edição CNC não encontrada.");

  await sql`
    UPDATE cnc_editions
    SET
      opening_note_title = ${fields.opening_note_title ?? current.openingNote.title},
      opening_note_body = ${fields.opening_note_body ?? current.openingNote.body},
      general_program_title = ${fields.general_program_title ?? current.generalProgram.title},
      general_program_body = ${fields.general_program_body ?? current.generalProgram.body},
      organizer = ${fields.organizer ?? current.contacts.organizer},
      email = ${fields.email ?? current.contacts.email},
      phone = ${fields.phone ?? current.contacts.phone ?? ""},
      notes = ${fields.notes ?? current.contacts.notes ?? ""},
      updated_at = NOW()
    WHERE year = ${year}
  `;
}

export async function upsertCncAsset(
  year: string,
  slot: string,
  data: { label?: string; url?: string | null; mime?: string | null; filename?: string | null },
): Promise<CncAsset> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO cnc_assets (id, year, slot, label, url, mime, filename)
    VALUES (
      ${id},
      ${year},
      ${slot},
      ${data.label ?? ""},
      ${data.url ?? null},
      ${data.mime ?? null},
      ${data.filename ?? null}
    )
    ON CONFLICT (year, slot) DO UPDATE SET
      label = COALESCE(NULLIF(EXCLUDED.label, ''), cnc_assets.label),
      url = EXCLUDED.url,
      mime = EXCLUDED.mime,
      filename = EXCLUDED.filename,
      updated_at = NOW()
    RETURNING id, year, slot, label, url, mime, filename
  `;
  return rows[0] as CncAsset;
}

export async function clearCncAsset(year: string, slot: string): Promise<void> {
  const sql = await sqlClient();
  await sql`
    UPDATE cnc_assets
    SET url = NULL, mime = NULL, filename = NULL, updated_at = NOW()
    WHERE year = ${year} AND slot = ${slot}
  `;
}

export async function createCncDiscipline(
  year: string,
  data: { title: string; description?: string; kind?: CncDisciplineKind },
): Promise<void> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const baseId = slugifyId(data.title);
  let id = baseId;
  for (let i = 2; i < 20; i++) {
    const clash = await sql`SELECT id FROM cnc_disciplines WHERE id = ${id} LIMIT 1`;
    if (clash.length === 0) break;
    id = `${baseId}-${i}`;
  }
  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max FROM cnc_disciplines WHERE year = ${year}
  `;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO cnc_disciplines (id, year, title, description, sort_order, kind)
    VALUES (
      ${id},
      ${year},
      ${data.title.trim()},
      ${data.description?.trim() || null},
      ${sort},
      ${data.kind ?? "resources"}
    )
  `;
}

export async function updateCncDiscipline(
  id: string,
  fields: { title?: string; description?: string | null; kind?: CncDisciplineKind; sort_order?: number },
): Promise<void> {
  const sql = await sqlClient();
  const currentRows = await sql`
    SELECT id, year, title, description, sort_order, kind
    FROM cnc_disciplines WHERE id = ${id} LIMIT 1
  `;
  const current = currentRows[0] as DisciplineRow | undefined;
  if (!current) throw new Error("Prova não encontrada.");

  await sql`
    UPDATE cnc_disciplines
    SET
      title = ${fields.title ?? current.title},
      description = ${fields.description === undefined ? current.description : fields.description},
      kind = ${fields.kind ?? current.kind},
      sort_order = ${fields.sort_order ?? current.sort_order},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteCncDiscipline(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_disciplines WHERE id = ${id} AND year = ${year}`;
  await sql`DELETE FROM cnc_assets WHERE year = ${year} AND slot LIKE ${`discipline:${id}:%`}`;
}

export async function reorderCncDiscipline(
  year: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const sql = await sqlClient();
  const rows = (await sql`
    SELECT id, sort_order FROM cnc_disciplines
    WHERE year = ${year}
    ORDER BY sort_order ASC, title ASC
  `) as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;

  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(swapWith, 0, moved);
  for (const [i, row] of reordered.entries()) {
    await sql`UPDATE cnc_disciplines SET sort_order = ${i}, updated_at = NOW() WHERE id = ${row.id}`;
  }
}

export async function createCncUsefulInfo(
  year: string,
  data: { title: string; description?: string },
): Promise<void> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const baseId = slugifyId(data.title);
  let id = baseId;
  for (let i = 2; i < 20; i++) {
    const clash = await sql`SELECT id FROM cnc_useful_info WHERE id = ${id} LIMIT 1`;
    if (clash.length === 0) break;
    id = `${baseId}-${i}`;
  }
  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max FROM cnc_useful_info WHERE year = ${year}
  `;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO cnc_useful_info (id, year, title, description, sort_order)
    VALUES (
      ${id},
      ${year},
      ${data.title.trim()},
      ${data.description?.trim() || null},
      ${sort}
    )
  `;
}

export async function updateCncUsefulInfo(
  id: string,
  fields: { title?: string; description?: string | null; sort_order?: number },
): Promise<void> {
  const sql = await sqlClient();
  const currentRows = await sql`
    SELECT id, year, title, description, sort_order
    FROM cnc_useful_info WHERE id = ${id} LIMIT 1
  `;
  const current = currentRows[0] as UsefulRow | undefined;
  if (!current) throw new Error("Item não encontrado.");

  await sql`
    UPDATE cnc_useful_info
    SET
      title = ${fields.title ?? current.title},
      description = ${fields.description === undefined ? current.description : fields.description},
      sort_order = ${fields.sort_order ?? current.sort_order},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteCncUsefulInfo(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_useful_info WHERE id = ${id} AND year = ${year}`;
  await sql`DELETE FROM cnc_assets WHERE year = ${year} AND slot = ${usefulSlot(id)}`;
}

export async function reorderCncUsefulInfo(
  year: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const sql = await sqlClient();
  const rows = (await sql`
    SELECT id, sort_order FROM cnc_useful_info
    WHERE year = ${year}
    ORDER BY sort_order ASC, title ASC
  `) as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;

  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(swapWith, 0, moved);
  for (const [i, row] of reordered.entries()) {
    await sql`UPDATE cnc_useful_info SET sort_order = ${i}, updated_at = NOW() WHERE id = ${row.id}`;
  }
}
