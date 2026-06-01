import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session.role) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    role: session.role,
    name: session.name ?? null,
    email: session.email ?? null,
    gescoAccess: session.role === "user" ? session.gescoAccess === true : false,
  });
}
