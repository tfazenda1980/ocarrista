import { type NextRequest, NextResponse } from "next/server";
import { dbConfigured } from "@/app/lib/db/client";
import { isImgcYearValid } from "@/app/lib/events/load-imgc";
import { createImgcMessage } from "@/app/lib/imgc/repository";
import { notifyAdminImgcMessage } from "@/app/lib/email/send";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ year: string }> },
) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: "Suggestions are unavailable at the moment." }, { status: 503 });
  }

  const { year } = await context.params;
  if (!isImgcYearValid(year)) {
    return NextResponse.json({ error: "Edition not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = body as {
    name?: string;
    email?: string;
    message?: string;
    website?: string;
  };

  if (String(data.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const message = String(data.message ?? "").trim();

  if (name.length < 2 || !email.includes("@")) {
    return NextResponse.json({ error: "A valid name and email are required." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Please write a suggestion (at least 10 characters)." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  try {
    await createImgcMessage(year, { name, email, body: message });
    try {
      await notifyAdminImgcMessage({ year, name, email, body: message });
    } catch (err) {
      console.error("[imgc] notifyAdminImgcMessage", err);
    }
    return NextResponse.json({
      ok: true,
      message: "Thank you. The organisation will read your suggestion.",
    });
  } catch (err) {
    const text = err instanceof Error ? err.message : "Could not send.";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
