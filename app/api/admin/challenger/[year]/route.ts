import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  getChallengerAdminData,
  listScores,
  updateChallengerSettings,
} from "@/app/lib/challenger/repository";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  const data = await getChallengerAdminData(year);
  const scores = await listScores(year);
  return NextResponse.json({ ...data, scores });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    provisional_visible?: boolean;
    final_visible?: boolean;
  };

  const settings = await updateChallengerSettings(year, data);
  return NextResponse.json({ settings });
}
