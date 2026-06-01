import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findMemberByEmail } from "@/app/lib/members/repository";
import { getSession } from "@/app/lib/auth/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { email?: string; password?: string };
  const email = String(data.email ?? "").trim();
  const password = String(data.password ?? "");

  const member = await findMemberByEmail(email);
  if (!member || member.status !== "approved" || !member.password_hash) {
    return NextResponse.json({ error: "Email ou password incorretos." }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, member.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Email ou password incorretos." }, { status: 401 });
  }

  const session = await getSession();
  session.role = "user";
  session.memberId = member.id;
  session.email = member.email;
  session.name = member.name;
  session.gescoAccess = member.gesco_access === true;
  await session.save();

  return NextResponse.json({ ok: true });
}
