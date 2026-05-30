import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { findMemberById, rejectMember } from "@/app/lib/members/repository";
import { notifyMemberRejected } from "@/app/lib/email/send";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const member = await findMemberById(id);
  if (!member || member.status !== "pending") {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const updated = await rejectMember(id);
  if (!updated) {
    return NextResponse.json({ error: "Não foi possível rejeitar." }, { status: 500 });
  }

  await notifyMemberRejected({
    memberName: updated.name,
    memberEmail: updated.email,
  });

  return NextResponse.json({ ok: true });
}
