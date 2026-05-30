import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findMemberBySetupToken, setMemberPassword } from "@/app/lib/members/repository";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { token?: string; password?: string };
  const token = String(data.token ?? "");
  const password = String(data.password ?? "");

  if (password.length < 8) {
    return NextResponse.json(
      { error: "A password deve ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  const member = await findMemberBySetupToken(token);
  if (!member) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const updated = await setMemberPassword(member.id, hash);
  if (!updated) {
    return NextResponse.json({ error: "Não foi possível guardar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
