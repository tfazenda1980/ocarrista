import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  attachCrewIds,
  mergeImportRows,
  parseChallengerExcel,
  parsedRowsFromDraft,
  rowsToDraftData,
} from "@/app/lib/challenger/import-scores";
import {
  getChallengerAdminData,
  listCrews,
  listCrewResultsDraft,
  listProvas,
  listScoresDraft,
  saveImportDraft,
} from "@/app/lib/challenger/repository";

export const runtime = "nodejs";

function readUploadFile(form: FormData): File | null {
  const entry = form.get("file");
  if (!entry || typeof entry === "string") return null;
  return entry as File;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;

  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }

    const file = readUploadFile(form);
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Ficheiro Excel em falta ou vazio." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseChallengerExcel(buffer);
    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { errors: parsed.errors, warnings: parsed.warnings },
        { status: 400 },
      );
    }

    const [crews, provas, existingScores, existingResults] = await Promise.all([
      listCrews(year, false),
      listProvas(year),
      listScoresDraft(year),
      listCrewResultsDraft(year),
    ]);

    const attached = attachCrewIds(parsed.rows, crews);
    const matched = attached.rows.filter((row) => row.crewId);
    if (matched.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhuma equipa do Excel corresponde às guarnições inscritas. Verifique os nomes na Folha2 e em Guarnições.",
          warnings: attached.warnings,
        },
        { status: 400 },
      );
    }

    const existingRows = parsedRowsFromDraft(crews, existingScores, existingResults, provas);
    const merged = mergeImportRows(attached.rows, existingRows);
    const draftData = rowsToDraftData(merged, provas);

    const allWarnings = [...parsed.warnings, ...attached.warnings, ...draftData.warnings];

    await saveImportDraft(year, file.name, draftData.scores, draftData.crewResults);

    const preview = await getChallengerAdminData(year);

    return NextResponse.json({
      ok: true,
      warnings: allWarnings,
      teams: matched.length,
      preview: {
        draftProvisional: preview.draftProvisional ?? [],
        draftFinal: preview.draftFinal ?? [],
        publishedProvisional: preview.provisional,
        publishedFinal: preview.final,
        importMeta: preview.importMeta,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao importar Excel.";
    console.error("[challenger/import]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
