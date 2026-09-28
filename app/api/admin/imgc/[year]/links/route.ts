import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createImgcLink,
  deleteImgcLink,
  getImgcLiveEdition,
  updateImgcLink,
} from "@/app/lib/imgc/repository";
import type { ImgcLinkCategory } from "@/app/lib/events/imgc-types";
import { cmsPlain } from "@/app/lib/i18n/localized";

const CATEGORIES: ImgcLinkCategory[] = ["tomar", "transport", "stay", "other"];

function isCategory(value: string): value is ImgcLinkCategory {
  return CATEGORIES.includes(value as ImgcLinkCategory);
}

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
    category?: string;
    title?: string;
    url?: string;
    description?: string;
  } | null;
  const category = String(body?.category ?? "other");
  const title = String(body?.title ?? "").trim();
  const url = String(body?.url ?? "").trim();
  if (!isCategory(category) || !title || !url) {
    return NextResponse.json({ error: "Categoria, título e URL são obrigatórios." }, { status: 400 });
  }
  try {
    await createImgcLink(year, { category, title, url, description: body?.description });
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
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
    category?: ImgcLinkCategory;
    title?: string;
    url?: string;
    description?: string;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }
  try {
    await updateImgcLink(body.id, body);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
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
    await deleteImgcLink(year, id);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
