import { NextResponse } from "next/server";
import { checkAdminCredentials } from "@/app/lib/auth/admin";
import { getSession } from "@/app/lib/auth/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { username?: string; password?: string };
  if (!checkAdminCredentials(String(data.username ?? ""), String(data.password ?? ""))) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const session = await getSession();
  session.role = "admin";
  session.memberId = undefined;
  session.email = undefined;
  session.name = undefined;
  await session.save();

  return NextResponse.json({ ok: true });
}
