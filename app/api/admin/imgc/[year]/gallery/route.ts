import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createImgcGalleryPhoto,
  deleteImgcGalleryPhoto,
  getImgcLiveEdition,
  updateImgcGalleryPhoto,
} from "@/app/lib/imgc/repository";
import { uploadImgcAsset } from "@/app/lib/imgc/upload";
import { cmsPlain } from "@/app/lib/i18n/localized";

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
  const form = await request.formData();
  const caption = String(form.get("caption") ?? "").trim();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fotografia obrigatória." }, { status: 400 });
  }
  try {
    const uploaded = await uploadImgcAsset(year, "gallery", file);
    await createImgcGalleryPhoto(year, {
      caption,
      url: uploaded.url,
      mime: uploaded.mime,
      filename: uploaded.filename,
    });
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao publicar fotografia.";
    return NextResponse.json({ error: message }, { status: 503 });
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
  const body = (await request.json().catch(() => null)) as { id?: string; caption?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }
  try {
    await updateImgcGalleryPhoto(body.id, { caption: body.caption });
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
    await deleteImgcGalleryPhoto(year, id);
    const event = await getImgcLiveEdition(year);
    return NextResponse.json({ ok: true, event: event ? cmsPlain(event) : event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
