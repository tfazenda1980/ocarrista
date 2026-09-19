import { type NextRequest, NextResponse } from "next/server";
import { dbConfigured } from "@/app/lib/db/client";
import { isCncYearValid } from "@/app/lib/events/load-cnc";
import { isCncMessageKind } from "@/app/lib/cnc/messages";
import { createCncMessage } from "@/app/lib/cnc/repository";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Mensagens indisponíveis de momento." }, { status: 503 });
  }

  const { year } = await context.params;
  if (!isCncYearValid(year)) {
    return NextResponse.json({ error: "Edição não encontrada." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as {
    kind?: string;
    provaId?: string;
    name?: string;
    email?: string;
    message?: string;
    website?: string;
  };

  if (String(data.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const kind = String(data.kind ?? "");
  if (!isCncMessageKind(kind)) {
    return NextResponse.json({ error: "Escolha o tipo de mensagem." }, { status: 400 });
  }

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const message = String(data.message ?? "").trim();
  const provaId = String(data.provaId ?? "").trim() || null;

  if (name.length < 2 || !email.includes("@")) {
    return NextResponse.json({ error: "Nome e email válidos são obrigatórios." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Escreva a mensagem (mínimo 10 caracteres)." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Mensagem demasiado longa." }, { status: 400 });
  }
  if (kind === "prova" && !provaId) {
    return NextResponse.json({ error: "Indique a prova a que se refere." }, { status: 400 });
  }

  try {
    await createCncMessage(year, { kind, provaId, name, email, body: message });
    return NextResponse.json({
      ok: true,
      message: "Mensagem recebida. A organização responderá quando possível.",
    });
  } catch (err) {
    const text = err instanceof Error ? err.message : "Erro ao enviar.";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
