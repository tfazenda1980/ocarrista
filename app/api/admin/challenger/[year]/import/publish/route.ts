import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import type { ChallengerPhase } from "@/app/lib/challenger/types";
import {
  getChallengerAdminData,
  publishChallengerPhase,
} from "@/app/lib/challenger/repository";

export const runtime = "nodejs";

export async function POST(
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

  const data = body as { phase?: ChallengerPhase; makeVisible?: boolean };
  if (data.phase !== "provisional" && data.phase !== "final") {
    return NextResponse.json({ error: "Fase inválida." }, { status: 400 });
  }

  try {
    const settings = await publishChallengerPhase(year, data.phase, {
      makeVisible: data.makeVisible ?? true,
    });
    const live = await getChallengerAdminData(year);
    return NextResponse.json({
      ok: true,
      settings,
      provisional: live.provisional,
      final: live.final,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao publicar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
