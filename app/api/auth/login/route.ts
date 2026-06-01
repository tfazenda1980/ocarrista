import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAdminCredentials } from "@/app/lib/auth/admin";
import { getSession } from "@/app/lib/auth/session";
import { findMemberByEmail } from "@/app/lib/members/repository";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { identifier?: string; password?: string };
  const identifier = String(data.identifier ?? "").trim();
  const password = String(data.password ?? "");

  if (!identifier || !password) {
    return NextResponse.json({ error: "Credenciais em falta." }, { status: 400 });
  }

  const session = await getSession();

  if (checkAdminCredentials(identifier, password)) {
    session.role = "admin";
    session.memberId = undefined;
    session.email = undefined;
    session.name = undefined;
    await session.save();
    return NextResponse.json({ ok: true, role: "admin" as const });
  }

  const member = await findMemberByEmail(identifier.toLowerCase());
  if (!member || member.status !== "approved" || !member.password_hash) {
    return NextResponse.json(
      { error: "Email ou password incorretos, ou adesão ainda não aprovada." },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(password, member.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Email ou password incorretos, ou adesão ainda não aprovada." },
      { status: 401 },
    );
  }

  session.role = "user";
  session.memberId = member.id;
  session.email = member.email;
  session.name = member.name;
  await session.save();

  return NextResponse.json({ ok: true, role: "user" as const });
}
