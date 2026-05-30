import { NextResponse } from "next/server";
import { checkModPassword } from "@/app/lib/workshop-qa/auth";
import { isQaRoomId } from "@/app/lib/workshop-qa/rooms";
import { updateQuestionStatus } from "@/app/lib/workshop-qa/store";
import type { QaQuestionStatus } from "@/app/lib/workshop-qa/types";

const STATUSES: QaQuestionStatus[] = ["pending", "approved", "answered", "hidden"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ year: string; id: string }> },
) {
  const { year, id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    modPassword?: string;
    room?: string;
    status?: QaQuestionStatus;
  };

  if (!checkModPassword(String(data.modPassword ?? ""))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const room = data.room ?? "";
  if (!isQaRoomId(room)) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }

  const status = data.status;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const updated = await updateQuestionStatus(year, room, id, status);
  if (!updated) {
    return NextResponse.json({ error: "Pergunta não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ question: updated });
}
