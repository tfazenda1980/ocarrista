import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { listAllMembers, listMembersByStatus } from "@/app/lib/members/repository";
import { toMemberPublic } from "@/app/lib/members/public";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [pending, all] = await Promise.all([
    listMembersByStatus("pending"),
    listAllMembers(),
  ]);

  return NextResponse.json({
    pending: pending.map(toMemberPublic),
    members: all.map(toMemberPublic),
  });
}
