import { getSql, dbConfigured } from "../db/client";
import { computeStandings } from "./standings";
import type {
  ChallengerCrew,
  ChallengerCrewMember,
  ChallengerLiveData,
  ChallengerPhase,
  ChallengerProva,
  ChallengerScore,
  ChallengerScoreKind,
  ChallengerSettings,
} from "./types";

function rowNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export async function ensureChallengerSettings(year: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO challenger_settings (year)
    VALUES (${year})
    ON CONFLICT (year) DO NOTHING
  `;
}

export async function getChallengerSettings(
  year: string,
): Promise<ChallengerSettings | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureChallengerSettings(year);
  const rows = await sql`
    SELECT year, provisional_visible, final_visible, updated_at::text
    FROM challenger_settings
    WHERE year = ${year}
    LIMIT 1
  `;
  const row = rows[0] as ChallengerSettings | undefined;
  return row ?? null;
}

export async function updateChallengerSettings(
  year: string,
  fields: { provisional_visible?: boolean; final_visible?: boolean },
): Promise<ChallengerSettings | null> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  await ensureChallengerSettings(year);
  const current = await getChallengerSettings(year);
  if (!current) throw new Error("Definições não encontradas");

  const provisional = fields.provisional_visible ?? current.provisional_visible;
  const finalVisible = fields.final_visible ?? current.final_visible;

  const rows = await sql`
    UPDATE challenger_settings
    SET provisional_visible = ${provisional},
        final_visible = ${finalVisible},
        updated_at = NOW()
    WHERE year = ${year}
    RETURNING year, provisional_visible, final_visible, updated_at::text
  `;
  return (rows[0] as ChallengerSettings) ?? null;
}

export async function listProvas(year: string): Promise<ChallengerProva[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT id, year, title, description, sort_order, sketch_url, sketch_label, sketch_mime,
           created_at::text, updated_at::text
    FROM challenger_provas
    WHERE year = ${year}
    ORDER BY sort_order ASC, created_at ASC
  `;
  return rows as ChallengerProva[];
}

export async function createProva(
  year: string,
  data: { title: string; description?: string; sort_order?: number },
): Promise<ChallengerProva> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO challenger_provas (id, year, title, description, sort_order)
    VALUES (
      ${id},
      ${year},
      ${data.title.trim()},
      ${data.description?.trim() || null},
      ${data.sort_order ?? 0}
    )
    RETURNING id, year, title, description, sort_order, sketch_url, sketch_label, sketch_mime,
              created_at::text, updated_at::text
  `;
  return rows[0] as ChallengerProva;
}

export async function updateProva(
  id: string,
  fields: {
    title?: string;
    description?: string | null;
    sort_order?: number;
    sketch_url?: string | null;
    sketch_label?: string | null;
    sketch_mime?: string | null;
  },
): Promise<ChallengerProva | null> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const current = await sql`
    SELECT * FROM challenger_provas WHERE id = ${id} LIMIT 1
  `;
  const row = current[0] as ChallengerProva | undefined;
  if (!row) return null;

  const rows = await sql`
    UPDATE challenger_provas
    SET title = ${fields.title?.trim() ?? row.title},
        description = ${fields.description !== undefined ? fields.description : row.description},
        sort_order = ${fields.sort_order ?? row.sort_order},
        sketch_url = ${fields.sketch_url !== undefined ? fields.sketch_url : row.sketch_url},
        sketch_label = ${fields.sketch_label !== undefined ? fields.sketch_label : row.sketch_label},
        sketch_mime = ${fields.sketch_mime !== undefined ? fields.sketch_mime : row.sketch_mime},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, year, title, description, sort_order, sketch_url, sketch_label, sketch_mime,
              created_at::text, updated_at::text
  `;
  return (rows[0] as ChallengerProva) ?? null;
}

export async function deleteProva(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const rows = await sql`DELETE FROM challenger_provas WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

async function loadMembersForYear(year: string): Promise<Map<string, ChallengerCrewMember[]>> {
  const sql = getSql();
  const map = new Map<string, ChallengerCrewMember[]>();
  if (!sql) return map;

  const rows = await sql`
    SELECT m.id, m.crew_id, m.position, m.name, m.role
    FROM challenger_crew_members m
    INNER JOIN challenger_crews c ON c.id = m.crew_id
    WHERE c.year = ${year}
    ORDER BY c.sort_order ASC, m.position ASC
  `;
  for (const row of rows as ChallengerCrewMember[]) {
    const list = map.get(row.crew_id) ?? [];
    list.push(row);
    map.set(row.crew_id, list);
  }
  return map;
}

export async function listCrews(year: string, activeOnly = false): Promise<ChallengerCrew[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = activeOnly
    ? await sql`
        SELECT id, year, name, sort_order, active, created_at::text, updated_at::text
        FROM challenger_crews
        WHERE year = ${year} AND active = true
        ORDER BY sort_order ASC, created_at ASC
      `
    : await sql`
        SELECT id, year, name, sort_order, active, created_at::text, updated_at::text
        FROM challenger_crews
        WHERE year = ${year}
        ORDER BY sort_order ASC, created_at ASC
      `;

  const crews = rows as Omit<ChallengerCrew, "members">[];
  const membersMap = await loadMembersForYear(year);
  return crews.map((crew) => ({
    ...crew,
    members: membersMap.get(crew.id) ?? [],
  }));
}

export async function createCrew(
  year: string,
  data: {
    name: string;
    sort_order?: number;
    members: { position: number; name: string; role?: string }[];
  },
): Promise<ChallengerCrew> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const crewId = crypto.randomUUID();

  await sql`
    INSERT INTO challenger_crews (id, year, name, sort_order)
    VALUES (${crewId}, ${year}, ${data.name.trim()}, ${data.sort_order ?? 0})
  `;

  for (const member of data.members) {
    await sql`
      INSERT INTO challenger_crew_members (id, crew_id, position, name, role)
      VALUES (
        ${crypto.randomUUID()},
        ${crewId},
        ${member.position},
        ${member.name.trim()},
        ${member.role?.trim() || null}
      )
    `;
  }

  const crews = await listCrews(year);
  return crews.find((c) => c.id === crewId)!;
}

export async function updateCrew(
  id: string,
  data: {
    name?: string;
    sort_order?: number;
    active?: boolean;
    members?: { position: number; name: string; role?: string }[];
  },
): Promise<ChallengerCrew | null> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  const currentRows = await sql`
    SELECT id, year, name, sort_order, active, created_at::text, updated_at::text
    FROM challenger_crews WHERE id = ${id} LIMIT 1
  `;
  const current = currentRows[0] as Omit<ChallengerCrew, "members"> | undefined;
  if (!current) return null;

  await sql`
    UPDATE challenger_crews
    SET name = ${data.name?.trim() ?? current.name},
        sort_order = ${data.sort_order ?? current.sort_order},
        active = ${data.active ?? current.active},
        updated_at = NOW()
    WHERE id = ${id}
  `;

  if (data.members) {
    await sql`DELETE FROM challenger_crew_members WHERE crew_id = ${id}`;
    for (const member of data.members) {
      await sql`
        INSERT INTO challenger_crew_members (id, crew_id, position, name, role)
        VALUES (
          ${crypto.randomUUID()},
          ${id},
          ${member.position},
          ${member.name.trim()},
          ${member.role?.trim() || null}
        )
      `;
    }
  }

  const crews = await listCrews(current.year);
  return crews.find((c) => c.id === id) ?? null;
}

export async function deleteCrew(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const rows = await sql`DELETE FROM challenger_crews WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function listScores(year: string): Promise<ChallengerScore[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT id, year, crew_id, prova_id, label, points, kind, phase, notes,
           created_at::text, updated_at::text
    FROM challenger_scores
    WHERE year = ${year}
    ORDER BY created_at ASC
  `;
  return (rows as ChallengerScore[]).map((row) => ({
    ...row,
    points: rowNumber(row.points),
  }));
}

export async function upsertScore(data: {
  id?: string;
  year: string;
  crew_id: string;
  prova_id?: string | null;
  label?: string;
  points: number;
  kind?: ChallengerScoreKind;
  phase: ChallengerPhase;
  notes?: string | null;
}): Promise<ChallengerScore> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const id = data.id ?? crypto.randomUUID();
  const kind = data.kind ?? (data.prova_id ? "prova" : "penalty");

  const rows = await sql`
    INSERT INTO challenger_scores (
      id, year, crew_id, prova_id, label, points, kind, phase, notes
    )
    VALUES (
      ${id},
      ${data.year},
      ${data.crew_id},
      ${data.prova_id ?? null},
      ${data.label?.trim() ?? ""},
      ${data.points},
      ${kind},
      ${data.phase},
      ${data.notes?.trim() || null}
    )
    ON CONFLICT (id) DO UPDATE SET
      crew_id = EXCLUDED.crew_id,
      prova_id = EXCLUDED.prova_id,
      label = EXCLUDED.label,
      points = EXCLUDED.points,
      kind = EXCLUDED.kind,
      phase = EXCLUDED.phase,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING id, year, crew_id, prova_id, label, points, kind, phase, notes,
              created_at::text, updated_at::text
  `;
  const row = rows[0] as ChallengerScore;
  return { ...row, points: rowNumber(row.points) };
}

export async function deleteScore(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const rows = await sql`DELETE FROM challenger_scores WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getChallengerLiveData(year: string): Promise<ChallengerLiveData> {
  if (!dbConfigured()) {
    return {
      configured: false,
      settings: null,
      provas: [],
      crews: [],
      provisional: [],
      final: [],
    };
  }

  const [settings, provas, crews, scores] = await Promise.all([
    getChallengerSettings(year),
    listProvas(year),
    listCrews(year, true),
    listScores(year),
  ]);

  return {
    configured: true,
    settings,
    provas,
    crews,
    provisional: computeStandings(crews, provas, scores, "provisional"),
    final: computeStandings(crews, provas, scores, "final"),
  };
}

export async function getChallengerAdminData(year: string): Promise<ChallengerLiveData> {
  if (!dbConfigured()) {
    return {
      configured: false,
      settings: null,
      provas: [],
      crews: [],
      provisional: [],
      final: [],
    };
  }

  const [settings, provas, crews, scores] = await Promise.all([
    getChallengerSettings(year),
    listProvas(year),
    listCrews(year, false),
    listScores(year),
  ]);

  return {
    configured: true,
    settings,
    provas,
    crews,
    provisional: computeStandings(
      crews.filter((c) => c.active),
      provas,
      scores,
      "provisional",
    ),
    final: computeStandings(
      crews.filter((c) => c.active),
      provas,
      scores,
      "final",
    ),
  };
}
