import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { dbConfigured } from "@/app/lib/db/client";
import { getCncLiveEdition, updateCncContent } from "@/app/lib/cnc/repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  try {
    if (!dbConfigured()) {
      const event = await getCncLiveEdition(year);
      return NextResponse.json({ configured: false, event });
    }
    const event = await getCncLiveEdition(year, { strict: true });
    if (!event) {
      return NextResponse.json({ error: "Edição CNC não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ configured: dbConfigured(), event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar CNC.";
    return NextResponse.json({ error: message, configured: dbConfigured() }, { status: 500 });
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

  const { year } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    opening_note_title?: string;
    opening_note_body?: string;
    general_program_title?: string;
    general_program_body?: string;
    organizer?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };

  try {
    await updateCncContent(year, data);
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao guardar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
