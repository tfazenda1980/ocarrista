import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { listMembersByStatus } from "@/app/lib/members/repository";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const pending = await listMembersByStatus("pending");
  return NextResponse.json({ pending });
}
