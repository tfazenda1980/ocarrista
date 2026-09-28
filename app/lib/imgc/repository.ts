import { getSql, dbConfigured } from "../db/client";
import { getImgcEdition } from "../events/load-imgc";
import type {
  ImgcDelegation,
  ImgcEventData,
  ImgcGalleryPhoto,
  ImgcLink,
  ImgcLinkCategory,
  ImgcMessage,
  ImgcPdfResource,
} from "../events/imgc-types";
import { ensureImgcSchema } from "./schema";
import { gallerySlot, programmeSlot } from "./upload";

type EditionRow = {
  year: string;
  about_title: string | null;
  about_body: string | null;
  barracks_title: string | null;
  barracks_body: string | null;
  practical_title: string | null;
  practical_body: string | null;
  programme_title: string | null;
  programme_body: string | null;
  organizer: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type AssetRow = {
  slot: string;
  label: string;
  url: string | null;
  mime: string | null;
  filename: string | null;
};

type DelegationRow = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  host: boolean;
  sort_order: number;
};

type LinkRow = {
  id: string;
  category: ImgcLinkCategory;
  title: string;
  url: string;
  description: string;
  sort_order: number;
};

type GalleryRow = {
  id: string;
  caption: string;
  sort_order: number;
};

export type { ImgcMessage };

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function sqlClient() {
  await ensureImgcSchema();
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  return sql;
}

export async function seedImgcYear(year: string): Promise<void> {
  const base = getImgcEdition(year);
  if (!base) return;
  const sql = await sqlClient();

  const existing = await sql`SELECT year FROM imgc_editions WHERE year = ${year} LIMIT 1`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO imgc_editions (
        year, about_title, about_body, barracks_title, barracks_body,
        practical_title, practical_body, programme_title, programme_body,
        organizer, email, phone, notes
      ) VALUES (
        ${year}, ${base.about.title}, ${base.about.body},
        ${base.barracks.title}, ${base.barracks.body},
        ${base.practical.title}, ${base.practical.body},
        ${base.programme.title}, ${base.programme.body},
        ${base.contacts.organizer}, ${base.contacts.email},
        ${base.contacts.phone ?? ""}, ${base.contacts.notes ?? ""}
      )
    `;
  }

  const delCount = await sql`SELECT id FROM imgc_delegations WHERE year = ${year} LIMIT 1`;
  if (delCount.length === 0) {
    for (const [i, item] of base.delegations.entries()) {
      await sql`
        INSERT INTO imgc_delegations (id, year, country, city, lat, lng, host, sort_order)
        VALUES (
          ${item.id}, ${year}, ${item.country}, ${item.city ?? ""},
          ${item.lat}, ${item.lng}, ${item.host ?? false}, ${i}
        )
      `;
    }
  }

  const linkCount = await sql`SELECT id FROM imgc_links WHERE year = ${year} LIMIT 1`;
  if (linkCount.length === 0) {
    for (const [i, item] of base.links.entries()) {
      await sql`
        INSERT INTO imgc_links (id, year, category, title, url, description, sort_order)
        VALUES (
          ${item.id}, ${year}, ${item.category}, ${item.title}, ${item.url},
          ${item.description ?? ""}, ${i}
        )
      `;
    }
  }
}

async function listAssets(year: string) {
  const sql = await sqlClient();
  return (await sql`
    SELECT slot, label, url, mime, filename FROM imgc_assets WHERE year = ${year}
  `) as AssetRow[];
}

function assetMap(rows: AssetRow[]) {
  return new Map(rows.map((row) => [row.slot, row]));
}

function pdfFromAsset(asset: AssetRow | undefined, fallback: ImgcPdfResource): ImgcPdfResource {
  if (!asset) return fallback;
  return {
    label: asset.label || fallback.label,
    href: asset.url || fallback.href,
    mime: asset.mime,
    filename: asset.filename,
  };
}

export async function getImgcLiveEdition(
  year: string,
  options?: { strict?: boolean },
): Promise<ImgcEventData | null> {
  const base = getImgcEdition(year);
  if (!base) return null;
  if (!dbConfigured()) {
    if (options?.strict) throw new Error("DATABASE_URL em falta");
    return base;
  }

  try {
    await seedImgcYear(year);
    const sql = await sqlClient();
    const [editionRows, delegationRows, linkRows, galleryRows, assets] = await Promise.all([
      sql`
        SELECT year, about_title, about_body, barracks_title, barracks_body,
               practical_title, practical_body, programme_title, programme_body,
               organizer, email, phone, notes
        FROM imgc_editions WHERE year = ${year} LIMIT 1
      `,
      sql`
        SELECT id, country, city, lat, lng, host, sort_order
        FROM imgc_delegations WHERE year = ${year}
        ORDER BY host DESC, sort_order ASC, country ASC
      `,
      sql`
        SELECT id, category, title, url, description, sort_order
        FROM imgc_links WHERE year = ${year}
        ORDER BY sort_order ASC, title ASC
      `,
      sql`
        SELECT id, caption, sort_order FROM imgc_gallery
        WHERE year = ${year} ORDER BY sort_order ASC, created_at ASC
      `,
      listAssets(year),
    ]);

    const edition = (editionRows[0] as EditionRow | undefined) ?? null;
    const assetsBySlot = assetMap(assets);

    const photoGallery = (galleryRows as GalleryRow[])
      .map((row) => {
        const src = assetsBySlot.get(gallerySlot(row.id))?.url;
        if (!src) return null;
        return { id: row.id, src, alt: row.caption || "Conference photograph" } satisfies ImgcGalleryPhoto;
      })
      .filter((photo): photo is ImgcGalleryPhoto => photo !== null);

    return {
      ...base,
      about: {
        title: edition?.about_title || base.about.title,
        body: edition?.about_body || base.about.body,
      },
      barracks: {
        title: edition?.barracks_title || base.barracks.title,
        body: edition?.barracks_body || base.barracks.body,
      },
      practical: {
        title: edition?.practical_title || base.practical.title,
        body: edition?.practical_body || base.practical.body,
      },
      programme: {
        title: edition?.programme_title || base.programme.title,
        body: edition?.programme_body || base.programme.body,
        pdf: pdfFromAsset(assetsBySlot.get(programmeSlot()), base.programme.pdf),
      },
      delegations: (delegationRows as DelegationRow[]).map((row) => ({
        id: row.id,
        country: row.country,
        city: row.city || undefined,
        lat: asNumber(row.lat),
        lng: asNumber(row.lng),
        host: Boolean(row.host),
      })),
      links: (linkRows as LinkRow[]).map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        url: row.url,
        description: row.description || undefined,
      })),
      photoGallery,
      contacts: {
        organizer: edition?.organizer || base.contacts.organizer,
        email: edition?.email || base.contacts.email,
        phone: edition?.phone || base.contacts.phone,
        notes: edition?.notes || base.contacts.notes,
      },
    };
  } catch (err) {
    if (options?.strict) throw err;
    console.warn("[imgc] live edition fallback JSON", err);
    return base;
  }
}

export async function updateImgcContent(
  year: string,
  fields: Partial<{
    about_title: string;
    about_body: string;
    barracks_title: string;
    barracks_body: string;
    practical_title: string;
    practical_body: string;
    programme_title: string;
    programme_body: string;
    organizer: string;
    email: string;
    phone: string;
    notes: string;
  }>,
): Promise<void> {
  await seedImgcYear(year);
  const sql = await sqlClient();
  const current = await getImgcLiveEdition(year, { strict: true });
  if (!current) throw new Error("Edição IMGC não encontrada.");

  await sql`
    UPDATE imgc_editions SET
      about_title = ${fields.about_title ?? current.about.title},
      about_body = ${fields.about_body ?? current.about.body},
      barracks_title = ${fields.barracks_title ?? current.barracks.title},
      barracks_body = ${fields.barracks_body ?? current.barracks.body},
      practical_title = ${fields.practical_title ?? current.practical.title},
      practical_body = ${fields.practical_body ?? current.practical.body},
      programme_title = ${fields.programme_title ?? current.programme.title},
      programme_body = ${fields.programme_body ?? current.programme.body},
      organizer = ${fields.organizer ?? current.contacts.organizer},
      email = ${fields.email ?? current.contacts.email},
      phone = ${fields.phone ?? current.contacts.phone ?? ""},
      notes = ${fields.notes ?? current.contacts.notes ?? ""},
      updated_at = NOW()
    WHERE year = ${year}
  `;
}

export async function upsertImgcAsset(
  year: string,
  slot: string,
  data: { label?: string; url?: string | null; mime?: string | null; filename?: string | null },
): Promise<void> {
  await seedImgcYear(year);
  const sql = await sqlClient();
  const id = `${year}:${slot}`;
  await sql`
    INSERT INTO imgc_assets (id, year, slot, label, url, mime, filename)
    VALUES (
      ${id}, ${year}, ${slot}, ${data.label ?? ""},
      ${data.url ?? null}, ${data.mime ?? null}, ${data.filename ?? null}
    )
    ON CONFLICT (year, slot) DO UPDATE SET
      label = COALESCE(NULLIF(${data.label ?? ""}, ''), imgc_assets.label),
      url = COALESCE(${data.url ?? null}, imgc_assets.url),
      mime = COALESCE(${data.mime ?? null}, imgc_assets.mime),
      filename = COALESCE(${data.filename ?? null}, imgc_assets.filename),
      updated_at = NOW()
  `;
}

export async function clearImgcAsset(year: string, slot: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM imgc_assets WHERE year = ${year} AND slot = ${slot}`;
}

export async function createImgcDelegation(
  year: string,
  data: { country: string; city?: string; lat: number; lng: number; host?: boolean },
): Promise<void> {
  await seedImgcYear(year);
  const sql = await sqlClient();
  const maxRows = await sql`SELECT COALESCE(MAX(sort_order), -1) AS max FROM imgc_delegations WHERE year = ${year}`;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO imgc_delegations (id, year, country, city, lat, lng, host, sort_order)
    VALUES (
      ${crypto.randomUUID()}, ${year}, ${data.country.trim()}, ${data.city?.trim() ?? ""},
      ${data.lat}, ${data.lng}, ${data.host ?? false}, ${sort}
    )
  `;
}

export async function updateImgcDelegation(
  id: string,
  fields: { country?: string; city?: string; lat?: number; lng?: number; host?: boolean },
): Promise<void> {
  const sql = await sqlClient();
  const rows = await sql`SELECT * FROM imgc_delegations WHERE id = ${id} LIMIT 1`;
  const current = rows[0] as DelegationRow | undefined;
  if (!current) throw new Error("Delegação não encontrada.");
  await sql`
    UPDATE imgc_delegations SET
      country = ${fields.country ?? current.country},
      city = ${fields.city ?? current.city},
      lat = ${fields.lat ?? current.lat},
      lng = ${fields.lng ?? current.lng},
      host = ${fields.host ?? current.host},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteImgcDelegation(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM imgc_delegations WHERE id = ${id} AND year = ${year}`;
}

export async function createImgcLink(
  year: string,
  data: { category: ImgcLinkCategory; title: string; url: string; description?: string },
): Promise<void> {
  await seedImgcYear(year);
  const sql = await sqlClient();
  const maxRows = await sql`SELECT COALESCE(MAX(sort_order), -1) AS max FROM imgc_links WHERE year = ${year}`;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO imgc_links (id, year, category, title, url, description, sort_order)
    VALUES (
      ${crypto.randomUUID()}, ${year}, ${data.category}, ${data.title.trim()},
      ${data.url.trim()}, ${data.description?.trim() ?? ""}, ${sort}
    )
  `;
}

export async function updateImgcLink(
  id: string,
  fields: { category?: ImgcLinkCategory; title?: string; url?: string; description?: string },
): Promise<void> {
  const sql = await sqlClient();
  const rows = await sql`SELECT * FROM imgc_links WHERE id = ${id} LIMIT 1`;
  const current = rows[0] as LinkRow | undefined;
  if (!current) throw new Error("Ligação não encontrada.");
  await sql`
    UPDATE imgc_links SET
      category = ${fields.category ?? current.category},
      title = ${fields.title ?? current.title},
      url = ${fields.url ?? current.url},
      description = ${fields.description ?? current.description},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteImgcLink(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM imgc_links WHERE id = ${id} AND year = ${year}`;
}

export async function createImgcGalleryPhoto(
  year: string,
  data: { caption?: string; url: string; mime?: string | null; filename?: string | null },
): Promise<void> {
  await seedImgcYear(year);
  const sql = await sqlClient();
  const id = crypto.randomUUID();
  const maxRows = await sql`SELECT COALESCE(MAX(sort_order), -1) AS max FROM imgc_gallery WHERE year = ${year}`;
  const sort = asNumber((maxRows[0] as { max: unknown })?.max) + 1;
  await sql`
    INSERT INTO imgc_gallery (id, year, caption, sort_order)
    VALUES (${id}, ${year}, ${data.caption?.trim() ?? ""}, ${sort})
  `;
  await upsertImgcAsset(year, gallerySlot(id), {
    label: data.caption?.trim() || "Fotografia",
    url: data.url,
    mime: data.mime ?? null,
    filename: data.filename ?? null,
  });
}

export async function updateImgcGalleryPhoto(id: string, fields: { caption?: string }): Promise<void> {
  const sql = await sqlClient();
  const rows = await sql`SELECT id, year, caption FROM imgc_gallery WHERE id = ${id} LIMIT 1`;
  const current = rows[0] as (GalleryRow & { year: string }) | undefined;
  if (!current) throw new Error("Fotografia não encontrada.");
  const caption = fields.caption === undefined ? current.caption : fields.caption.trim();
  await sql`UPDATE imgc_gallery SET caption = ${caption}, updated_at = NOW() WHERE id = ${id}`;
  await sql`
    UPDATE imgc_assets SET label = ${caption || "Fotografia"}, updated_at = NOW()
    WHERE year = ${current.year} AND slot = ${gallerySlot(id)}
  `;
}

export async function deleteImgcGalleryPhoto(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM imgc_gallery WHERE id = ${id} AND year = ${year}`;
  await sql`DELETE FROM imgc_assets WHERE year = ${year} AND slot = ${gallerySlot(id)}`;
}

export async function createImgcMessage(
  year: string,
  data: { name: string; email: string; body: string },
): Promise<void> {
  const sql = await sqlClient();
  await sql`
    INSERT INTO imgc_messages (id, year, name, email, body)
    VALUES (${crypto.randomUUID()}, ${year}, ${data.name}, ${data.email}, ${data.body})
  `;
}

export async function listImgcMessages(year: string): Promise<ImgcMessage[]> {
  const sql = await sqlClient();
  const rows = (await sql`
    SELECT id, year, name, email, body, created_at::text
    FROM imgc_messages WHERE year = ${year}
    ORDER BY created_at DESC
  `) as { id: string; year: string; name: string; email: string; body: string; created_at: string }[];
  return rows.map((row) => ({
    id: row.id,
    year: row.year,
    name: row.name,
    email: row.email,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function deleteImgcMessage(year: string, id: string): Promise<void> {
  const sql = await sqlClient();
  await sql`DELETE FROM imgc_messages WHERE id = ${id} AND year = ${year}`;
}
