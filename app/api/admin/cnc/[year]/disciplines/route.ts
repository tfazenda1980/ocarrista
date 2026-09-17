import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createCncDiscipline,
  deleteCncDiscipline,
  getCncLiveEdition,
  reorderCncDiscipline,
  updateCncDiscipline,
} from "@/app/lib/cnc/repository";
import type { CncDisciplineKind } from "@/app/lib/cnc/slots";

export const runtime = "nodejs";

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

  const data = body as { title?: string; description?: string; kind?: CncDisciplineKind };
  if (!data.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
  }

  try {
    await createCncDiscipline(year, {
      title: data.title,
      description: data.description,
      kind: data.kind === "gallery" ? "gallery" : "resources",
    });
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar prova.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  void context;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    id?: string;
    title?: string;
    description?: string | null;
    kind?: CncDisciplineKind;
    sort_order?: number;
    move?: "up" | "down";
  };
  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  try {
    const { year } = await context.params;
    if (data.move === "up" || data.move === "down") {
      await reorderCncDiscipline(year, data.id, data.move);
    } else {
      await updateCncDiscipline(data.id, {
        title: data.title,
        description: data.description,
        kind: data.kind,
        sort_order: data.sort_order,
      });
    }
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao actualizar prova.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  try {
    await deleteCncDiscipline(year, id);
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao eliminar prova.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
