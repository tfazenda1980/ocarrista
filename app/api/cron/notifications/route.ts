import { NextResponse } from "next/server";
import { runScheduledMemberNotifications } from "@/app/lib/notifications/run";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await runScheduledMemberNotifications();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/notifications]", err);
    return NextResponse.json({ error: "Falha ao processar notificações." }, { status: 500 });
  }
}
