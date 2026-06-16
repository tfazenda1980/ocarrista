import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  createCrew,
  deleteCrew,
  listCrews,
  updateCrew,
} from "@/app/lib/challenger/repository";

function parseMembers(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => m as { position?: number; name?: string; role?: string })
    .filter((m) => m.position && m.name?.trim())
    .map((m) => ({
      position: Number(m.position),
      name: String(m.name).trim(),
      role: m.role?.trim(),
    }))
    .slice(0, 4);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { year } = await context.params;
  const crews = await listCrews(year, false);
  return NextResponse.json({ crews });
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    name?: string;
    sort_order?: number;
    members?: unknown;
  };

  if (!data.name?.trim()) {
    return NextResponse.json({ error: "Nome da guarnição obrigatório." }, { status: 400 });
  }

  const members = parseMembers(data.members);
  if (members.length < 4) {
    return NextResponse.json(
      { error: "Indique os 4 elementos da guarnição." },
      { status: 400 },
    );
  }

  const crew = await createCrew(year, {
    name: data.name,
    sort_order: data.sort_order,
    members,
  });
  return NextResponse.json({ crew });
}

export async function PATCH(
  request: NextRequest,
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
    sort_order?: number;
    active?: boolean;
    members?: unknown;
  };

  if (!data.id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const crew = await updateCrew(data.id, {
    name: data.name,
    sort_order: data.sort_order,
    active: data.active,
    members: data.members ? parseMembers(data.members) : undefined,
  });

  if (!crew) {
    return NextResponse.json({ error: "Guarnição não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ crew });
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

  const ok = await deleteCrew(id);
  if (!ok) {
    return NextResponse.json({ error: "Guarnição não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
