import { getSql, dbConfigured } from "../db/client";
import { getCncEdition } from "../events/load-cnc";
import type {
  CncDiscipline,
  CncEventData,
  CncGalleryPhoto,
  CncNotice,
  CncSponsor,
  CncUsefulInfoItem,
} from "../events/cnc-types";
import { ensureCncSchema } from "./schema";
import type { CncAsset, CncDisciplineKind } from "./slots";
import type { CncMessage, CncMessageKind } from "./messages";
import {
  disciplineSlot,
  emptyResource,
  gallerySlot,
  generalProgramSlot,
  openingNoteSlot,
  regulationSlot,
  slugifyId,
  sponsorSlot,
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
  regulation_title: string | null;
  regulation_body: string | null;
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

type SponsorRow = {
  id: string;
  year: string;
  name: string;
  url: string;
  sort_order: number;
};

type GalleryRow = {
  id: string;
  year: string;
  caption: string;
  sort_order: number;
};

type NoticeRow = {
  id: string;
  year: string;
  body: string;
  active: boolean;
  created_at: string;
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
  if (existing.length > 0) {
    const previousOpeningNotes = [
      "Bem-vindos ao Concurso Nacional Combinado da Brigada Mecanizada e do Quartel da Cavalaria. Consulte o programa geral, as subsecções de cada prova e a informação útil antes da chegada ao quartel.",
      "É sempre um grande privilégio e motivo de orgulho contar com a visita e a participação de todos. Ano após ano, esta comunhão em torno do Cavalo serve como fonte de inspiração e dá força para que o legado equestre militar continue a ser trilhado. Em nome do Exmo. Comandante da Brigada Mecanizada e do Comandante do Quartel da Cavalaria, saudamos todos os que nos apoiaram na realização deste evento, todos os concorrentes e todos os visitantes, esperando que o XVII Concurso Nacional Combinado de Equitação supere todas as vossas expectativas.",
    ];
    for (const previous of previousOpeningNotes) {
      await sql`
        UPDATE cnc_editions
        SET
          opening_note_body = ${base.openingNote.body},
          updated_at = NOW()
        WHERE year = ${year}
          AND opening_note_body = ${previous}
      `;
    }
    return;
  }

  await sql`
    INSERT INTO cnc_editions (
      year, opening_note_title, opening_note_body,
      general_program_title, general_program_body,
      organizer, email, phone, notes,
      regulation_title, regulation_body
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
      ${base.contacts.notes ?? ""},
      ${base.regulation.title},
      ${base.regulation.body}
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

  for (const [index, sponsor] of base.sponsors.entries()) {
    const id = sponsor.id || slugifyId(sponsor.name);
    await sql`
      INSERT INTO cnc_sponsors (id, year, name, url, sort_order)
      VALUES (
        ${id},
        ${year},
        ${sponsor.name},
        ${sponsor.url ?? ""},
        ${index}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    if (sponsor.logo) {
      await sql`
        INSERT INTO cnc_assets (id, year, slot, label, url, mime, filename)
        VALUES (
          ${crypto.randomUUID()},
          ${year},
          ${sponsorSlot(id)},
          ${sponsor.name},
          ${sponsor.logo},
          ${null},
          ${null}
        )
        ON CONFLICT (year, slot) DO NOTHING
      `;
    }
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

function sponsorFromRow(
  row: SponsorRow,
  assets: Map<string, CncAsset>,
  fallback?: CncSponsor,
): CncSponsor {
  return {
    id: row.id,
    name: row.name,
    url: row.url || fallback?.url || "",
    logo: assets.get(sponsorSlot(row.id))?.url || fallback?.logo || "",
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
    const [editionRows, disciplineRows, usefulRows, sponsorRows, galleryRows, noticeRows, assets] = await Promise.all([
      sql`
        SELECT year, opening_note_title, opening_note_body,
               general_program_title, general_program_body,
               organizer, email, phone, notes,
               regulation_title, regulation_body
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
      sql`
        SELECT id, year, name, url, sort_order
        FROM cnc_sponsors
        WHERE year = ${year}
        ORDER BY sort_order ASC, name ASC
      `,
      sql`
        SELECT id, year, caption, sort_order
        FROM cnc_gallery
        WHERE year = ${year}
        ORDER BY sort_order ASC, created_at ASC
      `,
      sql`
        SELECT id, year, body, active, created_at::text
        FROM cnc_notices
        WHERE year = ${year}
        ORDER BY created_at DESC
      `,
      listAssets(year),
    ]);

    const edition = (editionRows[0] as EditionRow | undefined) ?? null;
    const assetsBySlot = assetMap(assets);
    const fallbackDiscipline = new Map(base.disciplines.map((d) => [d.id, d]));
    const fallbackUseful = new Map(base.usefulInfo.map((item) => [item.id, item]));
    const fallbackSponsors = new Map(
      base.sponsors.map((sponsor) => [sponsor.id || slugifyId(sponsor.name), sponsor]),
    );
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
    const sponsors = (sponsorRows as SponsorRow[]).map((row) =>
      sponsorFromRow(
        { ...row, sort_order: asNumber(row.sort_order) },
        assetsBySlot,
        fallbackSponsors.get(row.id),
      ),
    );
    const photoGallery = (galleryRows as GalleryRow[])
      .map((row) => {
        const src = assetsBySlot.get(gallerySlot(row.id))?.url;
        if (!src) return null;
        return {
          id: row.id,
          src,
          alt: row.caption || "Fotografia do CNC",
        } satisfies CncGalleryPhoto;
      })
      .filter((photo): photo is CncGalleryPhoto => photo !== null);
    const notices = (noticeRows as NoticeRow[]).map((row) => ({
      id: row.id,
      body: row.body,
      active: Boolean(row.active),
      createdAt: row.created_at,
    }));

    const regulationBase = base.regulation ?? {
      title: "Regulamento",
      body: "",
      pdf: { label: "Regulamento (PDF)", href: null },
    };

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
      regulation: {
        title: edition?.regulation_title || regulationBase.title,
        body: edition?.regulation_body || regulationBase.body,
        pdf: emptyResource(
          regulationBase.pdf?.label ?? "Regulamento (PDF)",
          assetsBySlot.get(regulationSlot()),
          regulationBase.pdf,
        ),
      },
      disciplines: disciplines.length > 0 ? disciplines : base.disciplines,
      usefulInfo: usefulInfo.length > 0 ? usefulInfo : base.usefulInfo,
      sponsors,
      photoGallery,
      notices,
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
    regulation_title?: string;
    regulation_body?: string;
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
      regulation_title = ${fields.regulation_title ?? current.regulation.title},
      regulation_body = ${fields.regulation_body ?? current.regulation.body},
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

function normalizeSponsorUrl(url: string | undefined): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function createCncSponsor(
  year: string,
  data: { name: string; url?: string },
): Promise<void> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const baseId = slugifyId(data.name);
  let id = baseId;
  for (let i = 2; i < 20; i++) {
    const clash = await sql`SELECT id FROM cnc_sponsors WHERE id = ${id} LIMIT 1`;
    if (clash.length === 0) break;
    id = `${baseId}-${i}`;
  }
  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max FROM cnc_sponsors WHERE year = ${year}
  `;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO cnc_sponsors (id, year, name, url, sort_order)
    VALUES (
      ${id},
      ${year},
      ${data.name.trim()},
      ${normalizeSponsorUrl(data.url)},
      ${sort}
    )
  `;
}

export async function updateCncSponsor(
  id: string,
  fields: { name?: string; url?: string; sort_order?: number },
): Promise<void> {
  const sql = await sqlClient();
  const currentRows = await sql`
    SELECT id, year, name, url, sort_order
    FROM cnc_sponsors WHERE id = ${id} LIMIT 1
  `;
  const current = currentRows[0] as SponsorRow | undefined;
  if (!current) throw new Error("Patrocinador não encontrado.");

  await sql`
    UPDATE cnc_sponsors
    SET
      name = ${fields.name ?? current.name},
      url = ${fields.url === undefined ? current.url : normalizeSponsorUrl(fields.url)},
      sort_order = ${fields.sort_order ?? current.sort_order},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteCncSponsor(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_sponsors WHERE id = ${id} AND year = ${year}`;
  await sql`DELETE FROM cnc_assets WHERE year = ${year} AND slot = ${sponsorSlot(id)}`;
}

export async function reorderCncSponsor(
  year: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const sql = await sqlClient();
  const rows = (await sql`
    SELECT id, sort_order FROM cnc_sponsors
    WHERE year = ${year}
    ORDER BY sort_order ASC, name ASC
  `) as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;

  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(swapWith, 0, moved);
  for (const [i, row] of reordered.entries()) {
    await sql`UPDATE cnc_sponsors SET sort_order = ${i}, updated_at = NOW() WHERE id = ${row.id}`;
  }
}

type MessageRow = {
  id: string;
  year: string;
  kind: CncMessageKind;
  prova_id: string | null;
  name: string;
  email: string;
  body: string;
  created_at: string;
};

function messageFromRow(row: MessageRow): CncMessage {
  return {
    id: row.id,
    year: row.year,
    kind: row.kind,
    provaId: row.prova_id,
    name: row.name,
    email: row.email,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function createCncMessage(
  year: string,
  data: {
    kind: CncMessageKind;
    provaId?: string | null;
    name: string;
    email: string;
    body: string;
  },
): Promise<CncMessage> {
  const sql = await sqlClient();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO cnc_messages (id, year, kind, prova_id, name, email, body)
    VALUES (
      ${id},
      ${year},
      ${data.kind},
      ${data.kind === "prova" ? data.provaId || null : null},
      ${data.name.trim()},
      ${data.email.trim().toLowerCase()},
      ${data.body.trim()}
    )
    RETURNING id, year, kind, prova_id, name, email, body, created_at::text
  `;
  return messageFromRow(rows[0] as MessageRow);
}

export async function listCncMessages(year: string): Promise<CncMessage[]> {
  const sql = await sqlClient();
  const rows = await sql`
    SELECT id, year, kind, prova_id, name, email, body, created_at::text
    FROM cnc_messages
    WHERE year = ${year}
    ORDER BY created_at DESC
  `;
  return (rows as MessageRow[]).map(messageFromRow);
}

export async function deleteCncMessage(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_messages WHERE id = ${id} AND year = ${year}`;
}

export async function createCncNotice(year: string, body: string): Promise<CncNotice> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO cnc_notices (id, year, body, active)
    VALUES (${id}, ${year}, ${body.trim()}, TRUE)
    RETURNING id, year, body, active, created_at::text
  `;
  const row = rows[0] as NoticeRow;
  return {
    id: row.id,
    body: row.body,
    active: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export async function setCncNoticeActive(
  year: string,
  id: string,
  active: boolean,
): Promise<void> {
  const sql = await sqlClient();
  await sql`
    UPDATE cnc_notices
    SET active = ${active}
    WHERE id = ${id} AND year = ${year}
  `;
}

export async function deleteCncNotice(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_notices WHERE id = ${id} AND year = ${year}`;
}

export async function createCncGalleryPhoto(
  year: string,
  data: { caption?: string; url: string; mime?: string | null; filename?: string | null },
): Promise<void> {
  await seedCncYear(year);
  const sql = await sqlClient();
  const id = crypto.randomUUID();
  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max FROM cnc_gallery WHERE year = ${year}
  `;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO cnc_gallery (id, year, caption, sort_order)
    VALUES (${id}, ${year}, ${data.caption?.trim() ?? ""}, ${sort})
  `;
  await upsertCncAsset(year, gallerySlot(id), {
    label: data.caption?.trim() || "Fotografia",
    url: data.url,
    mime: data.mime ?? null,
    filename: data.filename ?? null,
  });
}

export async function updateCncGalleryPhoto(
  id: string,
  fields: { caption?: string },
): Promise<void> {
  const sql = await sqlClient();
  const currentRows = await sql`
    SELECT id, year, caption, sort_order FROM cnc_gallery WHERE id = ${id} LIMIT 1
  `;
  const current = currentRows[0] as GalleryRow | undefined;
  if (!current) throw new Error("Fotografia não encontrada.");
  const caption = fields.caption === undefined ? current.caption : fields.caption.trim();
  await sql`
    UPDATE cnc_gallery
    SET caption = ${caption}, updated_at = NOW()
    WHERE id = ${id}
  `;
  await sql`
    UPDATE cnc_assets
    SET label = ${caption || "Fotografia"}, updated_at = NOW()
    WHERE year = ${current.year} AND slot = ${gallerySlot(id)}
  `;
}

export async function deleteCncGalleryPhoto(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM cnc_gallery WHERE id = ${id} AND year = ${year}`;
  await sql`DELETE FROM cnc_assets WHERE year = ${year} AND slot = ${gallerySlot(id)}`;
}

export async function reorderCncGalleryPhoto(
  year: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const sql = await sqlClient();
  const rows = (await sql`
    SELECT id, sort_order FROM cnc_gallery
    WHERE year = ${year}
    ORDER BY sort_order ASC, created_at ASC
  `) as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;

  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(swapWith, 0, moved);
  for (const [i, row] of reordered.entries()) {
    await sql`UPDATE cnc_gallery SET sort_order = ${i}, updated_at = NOW() WHERE id = ${row.id}`;
  }
}
