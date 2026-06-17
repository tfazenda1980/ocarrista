import { getSql, dbConfigured } from "../db/client";
import { computeDisplayStandings, computeStandings } from "./standings";
import type {
  ChallengerCrew,
  ChallengerCrewMember,
  ChallengerCrewResult,
  ChallengerLiveData,
  ChallengerPhase,
  ChallengerProva,
  ChallengerScore,
  ChallengerScoreKind,
  ChallengerSettings,
} from "./types";
import type { DraftCrewResultInput, DraftScoreInput } from "./import-scores";
import { ensureChallengerImportSchema } from "./import-schema";

function rowNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function emptyImportSettings(): Pick<
  ChallengerSettings,
  "draft_imported_at" | "draft_filename" | "provisional_published_at" | "final_published_at"
> {
  return {
    draft_imported_at: null,
    draft_filename: null,
    provisional_published_at: null,
    final_published_at: null,
  };
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

  try {
    const rows = await sql`
      SELECT year, provisional_visible, final_visible,
             draft_imported_at::text, draft_filename,
             provisional_published_at::text, final_published_at::text,
             updated_at::text
      FROM challenger_settings
      WHERE year = ${year}
      LIMIT 1
    `;
    const row = rows[0] as ChallengerSettings | undefined;
    return row ?? null;
  } catch {
    const rows = await sql`
      SELECT year, provisional_visible, final_visible, updated_at::text
      FROM challenger_settings
      WHERE year = ${year}
      LIMIT 1
    `;
    const row = rows[0] as Omit<
      ChallengerSettings,
      "draft_imported_at" | "draft_filename" | "provisional_published_at" | "final_published_at"
    > | undefined;
    return row ? { ...row, ...emptyImportSettings() } : null;
  }
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
  const row = rows[0] as Omit<
    ChallengerSettings,
    "draft_imported_at" | "draft_filename" | "provisional_published_at" | "final_published_at"
  > | undefined;
  if (!row) return null;
  return { ...row, ...emptyImportSettings() };
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

export async function listCrewResults(year: string): Promise<ChallengerCrewResult[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT year, crew_id, phase, start_time, end_time, gross_time,
             penalty_points, penalty_time_min, final_time, rank,
             updated_at::text
      FROM challenger_crew_results
      WHERE year = ${year}
    `;
    return (rows as ChallengerCrewResult[]).map((row) => ({
      ...row,
      penalty_points: row.penalty_points != null ? rowNumber(row.penalty_points) : null,
      penalty_time_min: row.penalty_time_min != null ? rowNumber(row.penalty_time_min) : null,
      rank: row.rank != null ? Number(row.rank) : null,
    }));
  } catch {
    return [];
  }
}

export async function listCrewResultsDraft(year: string): Promise<ChallengerCrewResult[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT year, crew_id, phase, start_time, end_time, gross_time,
             penalty_points, penalty_time_min, final_time, rank,
             updated_at::text
      FROM challenger_crew_results_draft
      WHERE year = ${year}
    `;
    return (rows as ChallengerCrewResult[]).map((row) => ({
      ...row,
      penalty_points: row.penalty_points != null ? rowNumber(row.penalty_points) : null,
      penalty_time_min: row.penalty_time_min != null ? rowNumber(row.penalty_time_min) : null,
      rank: row.rank != null ? Number(row.rank) : null,
    }));
  } catch {
    return [];
  }
}

export async function listScoresDraft(year: string): Promise<ChallengerScore[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT id, year, crew_id, prova_id, label, points, kind, phase, notes,
             created_at::text, updated_at::text
      FROM challenger_scores_draft
      WHERE year = ${year}
      ORDER BY created_at ASC
    `;
    return (rows as ChallengerScore[]).map((row) => ({
      ...row,
      points: rowNumber(row.points),
    }));
  } catch {
    return [];
  }
}

export async function saveImportDraft(
  year: string,
  filename: string,
  scores: DraftScoreInput[],
  crewResults: DraftCrewResultInput[],
): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  await ensureChallengerImportSchema();
  await ensureChallengerSettings(year);

  try {
    await sql`DELETE FROM challenger_scores_draft WHERE year = ${year}`;
    await sql`DELETE FROM challenger_crew_results_draft WHERE year = ${year}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Não foi possível preparar o rascunho de importação: ${message}`,
    );
  }

  for (const score of scores) {
    await sql`
      INSERT INTO challenger_scores_draft (
        id, year, crew_id, prova_id, label, points, kind, phase
      )
      VALUES (
        ${crypto.randomUUID()},
        ${year},
        ${score.crew_id},
        ${score.prova_id},
        ${score.label},
        ${score.points},
        ${score.kind},
        ${score.phase}
      )
    `;
  }

  for (const result of crewResults) {
    await sql`
      INSERT INTO challenger_crew_results_draft (
        year, crew_id, phase, start_time, end_time, gross_time,
        penalty_points, penalty_time_min, final_time, rank
      )
      VALUES (
        ${year},
        ${result.crew_id},
        ${result.phase},
        ${result.start_time},
        ${result.end_time},
        ${result.gross_time},
        ${result.penalty_points},
        ${result.penalty_time_min},
        ${result.final_time},
        ${result.rank}
      )
    `;
  }

  await sql`
    UPDATE challenger_settings
    SET draft_imported_at = NOW(),
        draft_filename = ${filename},
        updated_at = NOW()
    WHERE year = ${year}
  `;
}

export async function publishChallengerPhase(
  year: string,
  phase: ChallengerPhase,
  options?: { makeVisible?: boolean },
): Promise<ChallengerSettings | null> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");

  await ensureChallengerImportSchema();

  const draftScores = await listScoresDraft(year);
  const draftResults = await listCrewResultsDraft(year);
  const phaseScores = draftScores.filter((s) => s.phase === phase);
  const phaseResults = draftResults.filter((r) => r.phase === phase);

  if (phaseScores.length === 0 && phaseResults.length === 0) {
    throw new Error("Não há dados em rascunho para esta fase.");
  }

  await sql`DELETE FROM challenger_scores WHERE year = ${year} AND phase = ${phase}`;
  await sql`DELETE FROM challenger_crew_results WHERE year = ${year} AND phase = ${phase}`;

  for (const score of phaseScores) {
    await sql`
      INSERT INTO challenger_scores (
        id, year, crew_id, prova_id, label, points, kind, phase, notes
      )
      VALUES (
        ${crypto.randomUUID()},
        ${year},
        ${score.crew_id},
        ${score.prova_id},
        ${score.label},
        ${score.points},
        ${score.kind},
        ${phase},
        ${score.notes}
      )
    `;
  }

  for (const result of phaseResults) {
    await sql`
      INSERT INTO challenger_crew_results (
        year, crew_id, phase, start_time, end_time, gross_time,
        penalty_points, penalty_time_min, final_time, rank
      )
      VALUES (
        ${year},
        ${result.crew_id},
        ${phase},
        ${result.start_time},
        ${result.end_time},
        ${result.gross_time},
        ${result.penalty_points},
        ${result.penalty_time_min},
        ${result.final_time},
        ${result.rank}
      )
    `;
  }

  const current = await getChallengerSettings(year);
  if (!current) throw new Error("Definições não encontradas");

  const provisionalVisible =
    options?.makeVisible && phase === "provisional"
      ? true
      : current.provisional_visible;
  const finalVisible =
    options?.makeVisible && phase === "final" ? true : current.final_visible;

  const rows =
    phase === "provisional"
      ? await sql`
          UPDATE challenger_settings
          SET provisional_visible = ${provisionalVisible},
              final_visible = ${finalVisible},
              provisional_published_at = NOW(),
              updated_at = NOW()
          WHERE year = ${year}
          RETURNING year, provisional_visible, final_visible,
                    draft_imported_at::text, draft_filename,
                    provisional_published_at::text, final_published_at::text,
                    updated_at::text
        `
      : await sql`
          UPDATE challenger_settings
          SET provisional_visible = ${provisionalVisible},
              final_visible = ${finalVisible},
              final_published_at = NOW(),
              updated_at = NOW()
          WHERE year = ${year}
          RETURNING year, provisional_visible, final_visible,
                    draft_imported_at::text, draft_filename,
                    provisional_published_at::text, final_published_at::text,
                    updated_at::text
        `;
  return (rows[0] as ChallengerSettings) ?? null;
}

export async function getChallengerLiveData(year: string): Promise<ChallengerLiveData> {
  const empty: ChallengerLiveData = {
    configured: false,
    settings: null,
    provas: [],
    crews: [],
    classification: [],
    provisional: [],
    final: [],
  };
  if (!dbConfigured()) return empty;

  try {
    const [settings, provas, crews, scores, crewResults] = await Promise.all([
      getChallengerSettings(year),
      listProvas(year),
      listCrews(year, true),
      listScores(year),
      listCrewResults(year),
    ]);

    return {
      configured: true,
      settings,
      provas,
      crews,
      classification: computeDisplayStandings(crews, provas, scores, crewResults),
      provisional: computeStandings(crews, provas, scores, "provisional", crewResults),
      final: computeStandings(crews, provas, scores, "final", crewResults),
    };
  } catch {
    return empty;
  }
}

export async function getChallengerAdminData(year: string): Promise<ChallengerLiveData> {
  const empty: ChallengerLiveData = {
    configured: false,
    settings: null,
    provas: [],
    crews: [],
    classification: [],
    provisional: [],
    final: [],
  };
  if (!dbConfigured()) return empty;

  try {
    const [
      settings,
      provas,
      crews,
      scores,
      crewResults,
      draftScores,
      draftCrewResults,
    ] = await Promise.all([
      getChallengerSettings(year),
      listProvas(year),
      listCrews(year, false),
      listScores(year),
      listCrewResults(year),
      listScoresDraft(year),
      listCrewResultsDraft(year),
    ]);

    const activeCrews = crews.filter((c) => c.active);

    return {
      configured: true,
      settings,
      provas,
      crews,
      classification: computeDisplayStandings(activeCrews, provas, scores, crewResults),
      provisional: computeStandings(activeCrews, provas, scores, "provisional", crewResults),
      final: computeStandings(activeCrews, provas, scores, "final", crewResults),
      draftClassification: computeDisplayStandings(
        activeCrews,
        provas,
        draftScores,
        draftCrewResults,
      ),
      draftProvisional: computeStandings(
        activeCrews,
        provas,
        draftScores,
        "provisional",
        draftCrewResults,
      ),
      draftFinal: computeStandings(
        activeCrews,
        provas,
        draftScores,
        "final",
        draftCrewResults,
      ),
      importMeta: {
        importedAt: settings?.draft_imported_at ?? null,
        filename: settings?.draft_filename ?? null,
        provisionalPublishedAt: settings?.provisional_published_at ?? null,
        finalPublishedAt: settings?.final_published_at ?? null,
      },
    };
  } catch {
    return empty;
  }
}
