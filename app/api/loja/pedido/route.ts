import { NextResponse } from "next/server";
import { notifyShopRequest } from "@/app/lib/email/send";
import { getSession } from "@/app/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (session.role !== "user" || !session.email || !session.name) {
    return NextResponse.json({ error: "Acesso reservado a membros." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const data = body as { productName?: string; note?: string };
  const productName = String(data.productName ?? "").trim();
  if (productName.length < 2) {
    return NextResponse.json({ error: "Artigo inválido." }, { status: 400 });
  }

  const note = String(data.note ?? "").trim().slice(0, 500);
  const result = await notifyShopRequest({
    memberName: session.name,
    memberEmail: session.email,
    productName,
    note: note || undefined,
  });

  if (!result.sent) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível enviar o pedido por email. Tente mais tarde ou contacte a organização.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Pedido enviado. A organização responderá por email.",
  });
}
