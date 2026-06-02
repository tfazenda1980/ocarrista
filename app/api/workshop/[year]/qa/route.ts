import { type NextRequest, NextResponse } from "next/server";
import { checkWorkshopQaPassword, qaConfigured } from "@/app/lib/workshop-qa/auth";
import { isQaRoomId } from "@/app/lib/workshop-qa/rooms";
import {
  addQuestion,
  countRecentByIp,
  incrementRate,
  listQuestions,
  storageMode,
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

function readPassword(request: NextRequest): string {
  return (
    request.headers.get("x-workshop-qa") ??
    request.nextUrl.searchParams.get("password") ??
    ""
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const { year } = await context.params;
  const room = request.nextUrl.searchParams.get("room") ?? "";
  const password = readPassword(request);

  if (!isQaRoomId(room)) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }
  if (!checkWorkshopQaPassword(room, password)) {
    return NextResponse.json({ error: "Password incorreta." }, { status: 401 });
  }

  const questions = await listQuestions(year, room);
  const sorted = [...questions].sort((a, b) => a.createdAt - b.createdAt);
  return NextResponse.json({ questions: sorted, storage: storageMode() });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ year: string }> },
) {
  const { year } = await context.params;

  if (!qaConfigured()) {
    return NextResponse.json(
      { error: "Perguntas indisponíveis." },
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
  if (!checkWorkshopQaPassword(room, password)) {
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

  const mode = storageMode();
  if (mode === "unavailable") {
    return NextResponse.json(
      {
        error:
          "O envio de perguntas está temporariamente indisponível. Contacte a organização do workshop.",
      },
      { status: 503 },
    );
  }

  await addQuestion(year, question);
  await incrementRate(year, room, ip);

  return NextResponse.json({ ok: true, id: question.id, storage: mode });
}
