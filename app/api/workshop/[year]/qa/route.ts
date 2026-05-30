import { type NextRequest, NextResponse } from "next/server";
import { checkAudiencePassword, checkModPassword, qaConfigured } from "@/app/lib/workshop-qa/auth";
import { isQaRoomId } from "@/app/lib/workshop-qa/rooms";
import {
  addQuestion,
  countRecentByIp,
  incrementRate,
  listQuestions,
} from "@/app/lib/workshop-qa/store";
import type { QaQuestion } from "@/app/lib/workshop-qa/types";

const MAX_TEXT = 300;
const MAX_AUTHOR = 40;
const RATE_LIMIT = 5;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const { year } = await context.params;
  const room = request.nextUrl.searchParams.get("room") ?? "";
  const modPassword = request.headers.get("x-workshop-qa-mod") ?? "";

  if (!isQaRoomId(room)) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }
  if (!checkModPassword(modPassword)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const questions = await listQuestions(year, room);
  return NextResponse.json({ questions });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ year: string }> },
) {
  const { year } = await context.params;

  if (!qaConfigured()) {
    return NextResponse.json(
      { error: "Perguntas indisponíveis (configuração em falta)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    password?: string;
    room?: string;
    text?: string;
    author?: string;
  };

  const room = data.room ?? "";
  if (!isQaRoomId(room)) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }

  const password = String(data.password ?? "");
  if (!checkAudiencePassword(room, password)) {
    return NextResponse.json({ error: "Password incorreta." }, { status: 401 });
  }

  const text = String(data.text ?? "").trim();
  if (text.length < 8 || text.length > MAX_TEXT) {
    return NextResponse.json(
      { error: `A pergunta deve ter entre 8 e ${MAX_TEXT} caracteres.` },
      { status: 400 },
    );
  }

  const author = String(data.author ?? "Anónimo").trim().slice(0, MAX_AUTHOR) || "Anónimo";

  const ip = clientIp(request);
  const recent = await countRecentByIp(year, room, ip);
  if (recent >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Limite de perguntas atingido. Tente mais tarde." },
      { status: 429 },
    );
  }

  const question: QaQuestion = {
    id: crypto.randomUUID(),
    room,
    text,
    author,
    status: "pending",
    createdAt: Date.now(),
  };

  await addQuestion(year, question);
  await incrementRate(year, room, ip);

  return NextResponse.json({ ok: true, id: question.id });
}
