import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { dbConfigured } from "@/app/lib/db/client";
import { getImgcLiveEdition, updateImgcContent } from "@/app/lib/imgc/repository";
import { cmsPlain } from "@/app/lib/i18n/localized";

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
    const event = await getImgcLiveEdition(year, { strict: dbConfigured() });
    if (!event) {
      return NextResponse.json({ error: "Edição IMGC não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ configured: dbConfigured(), event: event ? cmsPlain(event) : event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar IMGC.";
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

  try {
    await updateImgcContent(year, body as Parameters<typeof updateImgcContent>[1]);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao guardar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
