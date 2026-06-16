import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { deleteScore, upsertScore } from "@/app/lib/challenger/repository";
import type { ChallengerPhase, ChallengerScoreKind } from "@/app/lib/challenger/types";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    id?: string;
    crew_id?: string;
    prova_id?: string | null;
    label?: string;
    points?: number;
    kind?: ChallengerScoreKind;
    phase?: ChallengerPhase;
    notes?: string | null;
  };

  if (!data.crew_id) {
    return NextResponse.json({ error: "Guarnição obrigatória." }, { status: 400 });
  }
  if (data.points === undefined || Number.isNaN(Number(data.points))) {
    return NextResponse.json({ error: "Pontuação inválida." }, { status: 400 });
  }

  const score = await upsertScore({
    id: data.id,
    year,
    crew_id: data.crew_id,
    prova_id: data.prova_id ?? null,
    label: data.label,
    points: Number(data.points),
    kind: data.kind,
    phase: data.phase ?? "provisional",
    notes: data.notes,
  });

  return NextResponse.json({ score });
}

export async function DELETE(
  request: NextRequest,
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const ok = await deleteScore(id);
  if (!ok) {
    return NextResponse.json({ error: "Registo não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
