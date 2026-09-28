import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createImgcDelegation,
  deleteImgcDelegation,
  getImgcLiveEdition,
  updateImgcDelegation,
} from "@/app/lib/imgc/repository";
import { pinForImgcDelegation } from "@/app/lib/imgc/countries";

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
    host?: boolean;
  } | null;
  const country = String(body?.country ?? "").trim();
  if (!country) {
    return NextResponse.json({ error: "Indique o nome oficial do país." }, { status: 400 });
  }
  try {
    const pin = pinForImgcDelegation(country, Boolean(body?.host));
    await createImgcDelegation(year, {
      country: pin.officialName,
      city: String(body?.city ?? "").trim() || pin.city,
      lat: pin.lat,
      lng: pin.lng,
      host: Boolean(body?.host),
    });
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 400 });
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
    host?: boolean;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }
  try {
    const country = String(body.country ?? "").trim();
    if (!country) {
      return NextResponse.json({ error: "Indique o nome oficial do país." }, { status: 400 });
    }
    const pin = pinForImgcDelegation(country, Boolean(body.host));
    await updateImgcDelegation(body.id, {
      country: pin.officialName,
      city: body.city !== undefined ? body.city : pin.city,
      lat: pin.lat,
      lng: pin.lng,
      host: Boolean(body.host),
    });
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 400 });
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
