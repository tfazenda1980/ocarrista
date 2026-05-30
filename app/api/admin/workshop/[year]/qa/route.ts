import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { isQaRoomId } from "@/app/lib/workshop-qa/rooms";
import { deleteQuestion, listQuestions, storageMode } from "@/app/lib/workshop-qa/store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  const room = request.nextUrl.searchParams.get("room") ?? "";
  if (!isQaRoomId(room)) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }

  const questions = await listQuestions(year, room);
  return NextResponse.json({
    questions: [...questions].sort((a, b) => a.createdAt - b.createdAt),
    storage: storageMode(),
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { year } = await context.params;
  const room = request.nextUrl.searchParams.get("room") ?? "";
  const id = request.nextUrl.searchParams.get("id") ?? "";

  if (!isQaRoomId(room) || !id) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const ok = await deleteQuestion(year, room, id);
  if (!ok) {
    return NextResponse.json({ error: "Pergunta não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
