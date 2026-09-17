import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createCncUsefulInfo,
  deleteCncUsefulInfo,
  getCncLiveEdition,
  reorderCncUsefulInfo,
  updateCncUsefulInfo,
} from "@/app/lib/cnc/repository";

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

  const data = body as { title?: string; description?: string };
  if (!data.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
  }

  try {
    await createCncUsefulInfo(year, { title: data.title, description: data.description });
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar item.";
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
    sort_order?: number;
    move?: "up" | "down";
  };
  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  try {
    const { year } = await context.params;
    if (data.move === "up" || data.move === "down") {
      await reorderCncUsefulInfo(year, data.id, data.move);
    } else {
      await updateCncUsefulInfo(data.id, {
        title: data.title,
        description: data.description,
        sort_order: data.sort_order,
      });
    }
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao actualizar item.";
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
    await deleteCncUsefulInfo(year, id);
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao eliminar item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
