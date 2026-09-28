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
import { imgcCountryKey } from "./countries";
import {
  applyAdminLocale,
  displayLocalized,
  localizeContent,
  overlayLocalized,
  serializeLocalized,
} from "../i18n/localized";
import { type Locale } from "../i18n/config";

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
        ${year}, ${serializeLocalized(base.about.title)}, ${serializeLocalized(base.about.body)},
        ${serializeLocalized(base.barracks.title)}, ${serializeLocalized(base.barracks.body)},
        ${serializeLocalized(base.practical.title)}, ${serializeLocalized(base.practical.body)},
        ${serializeLocalized(base.programme.title)}, ${serializeLocalized(base.programme.body)},
        ${serializeLocalized(base.contacts.organizer)}, ${base.contacts.email},
        ${base.contacts.phone ?? ""}, ${serializeLocalized(base.contacts.notes ?? "")}
      )
    `;
  }

  const existingRows = (await sql`
    SELECT id, country FROM imgc_delegations WHERE year = ${year}
  `) as { id: string; country: string }[];
  const byKey = new Map(existingRows.map((row) => [imgcCountryKey(row.country), row]));

  for (const [i, item] of base.delegations.entries()) {
    const key = imgcCountryKey(item.country);
    const found = byKey.get(key);
    if (found) {
      await sql`
        UPDATE imgc_delegations SET
          sort_order = ${i},
          host = ${item.host ?? false},
          updated_at = NOW()
        WHERE id = ${found.id}
      `;
      continue;
    }
    await sql`
      INSERT INTO imgc_delegations (id, year, country, city, lat, lng, host, sort_order)
      VALUES (
        ${item.id}, ${year}, ${item.country}, ${item.city ?? ""},
        ${item.lat}, ${item.lng}, ${item.host ?? false}, ${i}
      )
    `;
  }

  const linkCount = await sql`SELECT id FROM imgc_links WHERE year = ${year} LIMIT 1`;
  if (linkCount.length === 0) {
    for (const [i, item] of base.links.entries()) {
      await sql`
        INSERT INTO imgc_links (id, year, category, title, url, description, sort_order)
        VALUES (
          ${item.id}, ${year}, ${item.category}, ${serializeLocalized(item.title)}, ${item.url},
          ${serializeLocalized(item.description ?? "")}, ${i}
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
    label: overlayLocalized(asset.label, fallback.label, "en") as ImgcPdfResource["label"],
    href: asset.url || fallback.href,
    mime: asset.mime,
    filename: asset.filename,
  };
}

export async function getImgcLiveEdition(
  year: string,
  options?: { strict?: boolean; resolveLocale?: Locale },
): Promise<ImgcEventData | null> {
  const base = getImgcEdition(year);
  if (!base) return null;
  const resolve = (event: ImgcEventData) =>
    options?.resolveLocale ? localizeContent(event, options.resolveLocale) : event;
  if (!dbConfigured()) {
    if (options?.strict) throw new Error("DATABASE_URL em falta");
    return resolve(base);
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
        ORDER BY sort_order ASC, country ASC
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

    const linksById = new Map(base.links.map((item) => [item.id, item]));

    return resolve({
      ...base,
      about: {
        title: overlayLocalized(edition?.about_title, base.about.title, "en") as ImgcEventData["about"]["title"],
        body: overlayLocalized(edition?.about_body, base.about.body, "en") as ImgcEventData["about"]["body"],
      },
      barracks: {
        title: overlayLocalized(edition?.barracks_title, base.barracks.title, "en") as ImgcEventData["barracks"]["title"],
        body: overlayLocalized(edition?.barracks_body, base.barracks.body, "en") as ImgcEventData["barracks"]["body"],
      },
      practical: {
        title: overlayLocalized(edition?.practical_title, base.practical.title, "en") as ImgcEventData["practical"]["title"],
        body: overlayLocalized(edition?.practical_body, base.practical.body, "en") as ImgcEventData["practical"]["body"],
      },
      programme: {
        title: overlayLocalized(edition?.programme_title, base.programme.title, "en") as ImgcEventData["programme"]["title"],
        body: overlayLocalized(edition?.programme_body, base.programme.body, "en") as ImgcEventData["programme"]["body"],
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
      links: (linkRows as LinkRow[]).map((row) => {
        const fallback = linksById.get(row.id);
        return {
          id: row.id,
          category: row.category,
          title: overlayLocalized(row.title, fallback?.title, "en") as ImgcLink["title"],
          url: row.url,
          description: overlayLocalized(row.description, fallback?.description, "en") as ImgcLink["description"],
        };
      }),
      photoGallery,
      contacts: {
        organizer: overlayLocalized(
          edition?.organizer,
          base.contacts.organizer,
          "en",
        ) as ImgcEventData["contacts"]["organizer"],
        email: edition?.email || base.contacts.email,
        phone: edition?.phone || base.contacts.phone,
        notes: overlayLocalized(edition?.notes, base.contacts.notes, "en") as ImgcEventData["contacts"]["notes"],
      },
    });
  } catch (err) {
    if (options?.strict) throw err;
    console.warn("[imgc] live edition fallback JSON", err);
    return resolve(base);
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
  const base = getImgcEdition(year);
  const current = await getImgcLiveEdition(year, { strict: true });
  if (!current || !base) throw new Error("Edição IMGC não encontrada.");

  await sql`
    UPDATE imgc_editions SET
      about_title = ${applyAdminLocale(current.about.title, base.about.title, fields.about_title ?? displayLocalized(current.about.title), "pt")},
      about_body = ${applyAdminLocale(current.about.body, base.about.body, fields.about_body ?? displayLocalized(current.about.body), "pt")},
      barracks_title = ${applyAdminLocale(current.barracks.title, base.barracks.title, fields.barracks_title ?? displayLocalized(current.barracks.title), "pt")},
      barracks_body = ${applyAdminLocale(current.barracks.body, base.barracks.body, fields.barracks_body ?? displayLocalized(current.barracks.body), "pt")},
      practical_title = ${applyAdminLocale(current.practical.title, base.practical.title, fields.practical_title ?? displayLocalized(current.practical.title), "pt")},
      practical_body = ${applyAdminLocale(current.practical.body, base.practical.body, fields.practical_body ?? displayLocalized(current.practical.body), "pt")},
      programme_title = ${applyAdminLocale(current.programme.title, base.programme.title, fields.programme_title ?? displayLocalized(current.programme.title), "pt")},
      programme_body = ${applyAdminLocale(current.programme.body, base.programme.body, fields.programme_body ?? displayLocalized(current.programme.body), "pt")},
      organizer = ${applyAdminLocale(current.contacts.organizer, base.contacts.organizer, fields.organizer ?? displayLocalized(current.contacts.organizer), "pt")},
      email = ${fields.email ?? current.contacts.email},
      phone = ${fields.phone ?? current.contacts.phone ?? ""},
      notes = ${applyAdminLocale(current.contacts.notes, base.contacts.notes, fields.notes ?? displayLocalized(current.contacts.notes ?? ""), "pt")},
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
