import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createProva,
  deleteProva,
  listProvas,
  updateProva,
} from "@/app/lib/challenger/repository";
import { uploadChallengerSketch } from "@/app/lib/challenger/upload";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { year } = await context.params;
  const provas = await listProvas(year);
  return NextResponse.json({ provas });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const sortOrder = Number(form.get("sort_order") ?? 0);
    const file = form.get("sketch");

    if (!title) {
      return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
    }

    const prova = await createProva(year, {
      title,
      description: description || undefined,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    if (file instanceof File && file.size > 0) {
      try {
        const uploaded = await uploadChallengerSketch(year, prova.id, file);
        const updated = await updateProva(prova.id, {
          sketch_url: uploaded.url,
          sketch_label: uploaded.label,
          sketch_mime: uploaded.mime,
        });
        return NextResponse.json({ prova: updated ?? prova });
      } catch (err) {
        await deleteProva(prova.id);
        const message = err instanceof Error ? err.message : "Erro no upload.";
        return NextResponse.json({ error: message }, { status: 503 });
      }
    }

    return NextResponse.json({ prova });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { title?: string; description?: string; sort_order?: number };
  if (!data.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
  }

  const prova = await createProva(year, {
    title: data.title,
    description: data.description,
    sort_order: data.sort_order,
  });
  return NextResponse.json({ prova });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const id = String(form.get("id") ?? "");
    if (!id) {
      return NextResponse.json({ error: "ID em falta." }, { status: 400 });
    }

    const fields: Parameters<typeof updateProva>[1] = {};
    if (form.has("title")) fields.title = String(form.get("title") ?? "");
    if (form.has("description")) {
      fields.description = String(form.get("description") ?? "") || null;
    }
    if (form.has("sort_order")) {
      fields.sort_order = Number(form.get("sort_order") ?? 0);
    }
    if (form.has("sketch_url")) {
      fields.sketch_url = String(form.get("sketch_url") ?? "") || null;
    }

    const file = form.get("sketch");
    if (file instanceof File && file.size > 0) {
      const { year } = await context.params;
      try {
        const uploaded = await uploadChallengerSketch(year, id, file);
        fields.sketch_url = uploaded.url;
        fields.sketch_label = uploaded.label;
        fields.sketch_mime = uploaded.mime;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro no upload.";
        return NextResponse.json({ error: message }, { status: 503 });
      }
    }

    const prova = await updateProva(id, fields);
    if (!prova) {
      return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ prova });
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
    sketch_url?: string | null;
    sketch_label?: string | null;
    sketch_mime?: string | null;
  };

  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const prova = await updateProva(data.id, data);
  if (!prova) {
    return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ prova });
}

export async function DELETE(
  request: NextRequest,
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const ok = await deleteProva(id);
  if (!ok) {
    return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
