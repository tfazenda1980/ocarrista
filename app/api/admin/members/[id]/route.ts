import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  deleteMember,
  findMemberByEmail,
  findMemberById,
  updateMember,
} from "@/app/lib/members/repository";
import { toMemberPublic } from "@/app/lib/members/public";
import type { MemberStatus } from "@/app/lib/members/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const member = await findMemberById(id);
  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    name?: string;
    email?: string;
    gescoAccess?: boolean;
    status?: MemberStatus;
  };

  const name = data.name !== undefined ? String(data.name).trim() : undefined;
  const email = data.email !== undefined ? String(data.email).trim().toLowerCase() : undefined;

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  if (email && email !== member.email) {
    const existing = await findMemberByEmail(email);
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Email já registado." }, { status: 409 });
    }
  }

  const allowedStatuses: MemberStatus[] = ["pending", "approved", "rejected"];
  const status =
    data.status !== undefined && allowedStatuses.includes(data.status)
      ? data.status
      : undefined;

  const updated = await updateMember(id, {
    name,
    email,
    gesco_access: data.gescoAccess,
    status,
  });

  if (!updated) {
    return NextResponse.json({ error: "Não foi possível actualizar." }, { status: 500 });
  }

  return NextResponse.json({ member: toMemberPublic(updated) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteMember(id);
  if (!deleted) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
