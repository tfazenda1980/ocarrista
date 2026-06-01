import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { approveMemberForSetup, findMemberById } from "@/app/lib/members/repository";
import { notifyMemberApproved } from "@/app/lib/email/send";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let gescoAccess = false;
  try {
    const body = (await request.json()) as { gescoAccess?: boolean };
    gescoAccess = body.gescoAccess === true;
  } catch {
    /* corpo vazio — sem acesso GesCO */
  }

  const { id } = await context.params;
  const member = await findMemberById(id);
  if (!member || member.status !== "pending") {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const updated = await approveMemberForSetup(id, token, expires, gescoAccess);
  if (!updated) {
    return NextResponse.json({ error: "Não foi possível aprovar." }, { status: 500 });
  }

  const emailResult = await notifyMemberApproved({
    memberName: updated.name,
    memberEmail: updated.email,
    setupToken: token,
  });

  return NextResponse.json({
    ok: true,
    gescoAccess: updated.gesco_access,
    emailSent: emailResult.sent,
    setupUrl: "setupUrl" in emailResult ? emailResult.setupUrl : undefined,
  });
}
