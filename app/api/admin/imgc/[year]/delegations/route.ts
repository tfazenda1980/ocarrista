import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createImgcDelegation,
  deleteImgcDelegation,
  getImgcLiveEdition,
  updateImgcDelegation,
} from "@/app/lib/imgc/repository";

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
  const body = (await request.json().catch(() => null)) as {
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
    host?: boolean;
  } | null;
  const country = String(body?.country ?? "").trim();
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!country || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "País, latitude e longitude são obrigatórios." }, { status: 400 });
  }
  try {
    await createImgcDelegation(year, {
      country,
      city: body?.city,
      lat,
      lng,
      host: Boolean(body?.host),
    });
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
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
  const { year } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
    host?: boolean;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }
  try {
    await updateImgcDelegation(body.id, body);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
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
  if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  try {
    await deleteImgcDelegation(year, id);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
