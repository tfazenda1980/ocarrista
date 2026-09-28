import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import { deleteImgcMessage, listImgcMessages } from "@/app/lib/imgc/repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  const session = await getSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { year } = await context.params;
  try {
    const messages = await listImgcMessages(year);
    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  try {
    await deleteImgcMessage(year, id);
    const messages = await listImgcMessages(year);
    return NextResponse.json({ ok: true, messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
