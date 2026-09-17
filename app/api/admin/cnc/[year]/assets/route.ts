import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import {
  clearCncAsset,
  getCncLiveEdition,
  upsertCncAsset,
} from "@/app/lib/cnc/repository";
import { uploadCncAsset } from "@/app/lib/cnc/upload";

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
  const form = await request.formData();
  const slot = String(form.get("slot") ?? "").trim();
  const label = String(form.get("label") ?? "").trim();
  const clear = form.get("clear") === "1";
  const file = form.get("file");

  if (!slot) {
    return NextResponse.json({ error: "Slot em falta." }, { status: 400 });
  }

  try {
    if (clear) {
      await clearCncAsset(year, slot);
    } else if (file instanceof File && file.size > 0) {
      const uploaded = await uploadCncAsset(year, slot, file);
      await upsertCncAsset(year, slot, {
        label: label || file.name,
        url: uploaded.url,
        mime: uploaded.mime,
        filename: uploaded.filename,
      });
    } else if (label) {
      await upsertCncAsset(year, slot, { label });
    } else {
      return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
    }

    const event = await getCncLiveEdition(year);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no documento.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
