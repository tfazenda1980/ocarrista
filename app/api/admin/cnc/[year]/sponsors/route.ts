import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createCncSponsor,
  deleteCncSponsor,
  getCncLiveEdition,
  reorderCncSponsor,
  updateCncSponsor,
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

  const data = body as { name?: string; url?: string };
  if (!data.name?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
  }

  try {
    await createCncSponsor(year, { name: data.name, url: data.url });
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar patrocinador.";
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
    name?: string;
    url?: string;
    sort_order?: number;
    move?: "up" | "down";
  };
  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  try {
    const { year } = await context.params;
    if (data.move === "up" || data.move === "down") {
      await reorderCncSponsor(year, data.id, data.move);
    } else {
      await updateCncSponsor(data.id, {
        name: data.name,
        url: data.url,
        sort_order: data.sort_order,
      });
    }
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao actualizar patrocinador.";
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
    await deleteCncSponsor(year, id);
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao eliminar patrocinador.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
