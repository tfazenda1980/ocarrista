import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createCncGalleryPhoto,
  deleteCncGalleryPhoto,
  getCncLiveEdition,
  reorderCncGalleryPhoto,
  updateCncGalleryPhoto,
} from "@/app/lib/cnc/repository";
import { uploadCncAsset } from "@/app/lib/cnc/upload";

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
    const uploaded = await uploadCncAsset(year, "gallery", file);
    await createCncGalleryPhoto(year, {
      caption,
      url: uploaded.url,
      mime: uploaded.mime,
      filename: uploaded.filename,
    });
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    id?: string;
    caption?: string;
    move?: "up" | "down";
  };
  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  try {
    const { year } = await context.params;
    if (data.move === "up" || data.move === "down") {
      await reorderCncGalleryPhoto(year, data.id, data.move);
    } else {
      await updateCncGalleryPhoto(data.id, { caption: data.caption });
    }
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao actualizar fotografia.";
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
    await deleteCncGalleryPhoto(year, id);
    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao eliminar fotografia.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
