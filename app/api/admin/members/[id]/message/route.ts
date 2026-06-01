import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { findMemberById } from "@/app/lib/members/repository";
import { sendAdminMessageToMember } from "@/app/lib/email/send";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const member = await findMemberById(id);
  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  if (member.status !== "approved") {
    return NextResponse.json(
      { error: "Só pode enviar mensagens a membros aprovados." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { subject?: string; message?: string };
  const subject = String(data.subject ?? "").trim();
  const message = String(data.message ?? "").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Assunto e mensagem são obrigatórios." }, { status: 400 });
  }

  const result = await sendAdminMessageToMember({
    memberName: member.name,
    memberEmail: member.email,
    subject,
    message,
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: "Email não enviado. Verifique RESEND_API_KEY e EMAIL_FROM na Vercel." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
