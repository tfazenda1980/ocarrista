import { NextResponse } from "next/server";
import { dbConfigured } from "@/app/lib/db/client";
import { createPendingMember, findMemberByEmail } from "@/app/lib/members/repository";
import { notifyAdminNewMember } from "@/app/lib/email/send";

export async function POST(request: Request) {
  if (!dbConfigured()) {
    return NextResponse.json(
      { error: "Adesões indisponíveis (base de dados não configurada)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { name?: string; email?: string };
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();

  if (name.length < 2 || !email.includes("@")) {
    return NextResponse.json({ error: "Nome e email válidos são obrigatórios." }, { status: 400 });
  }

  const existing = await findMemberByEmail(email);
  if (existing) {
    if (existing.status === "pending") {
      return NextResponse.json({
        ok: true,
        message: "Já existe um pedido em análise para este email.",
      });
    }
    if (existing.status === "approved") {
      return NextResponse.json({
        ok: true,
        message: "Este email já está registado. Pode entrar em /entrar.",
      });
    }
    return NextResponse.json({
      error: "Este email já foi utilizado num pedido anterior.",
    }, { status: 409 });
  }

  const member = await createPendingMember(email, name);
  await notifyAdminNewMember({ memberName: member.name, memberEmail: member.email });

  return NextResponse.json({
    ok: true,
    message:
      "Pedido recebido. Será notificado por email quando a adesão for aprovada.",
  });
}
