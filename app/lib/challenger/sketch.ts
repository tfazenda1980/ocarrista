export type ChallengerSketchKind = "pdf" | "image" | "download";

export const CHALLENGER_SKETCH_ACCEPT =
  ".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,image/*,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function getSketchKind(
  mime: string | null,
  url: string | null,
): ChallengerSketchKind {
  if (!url) return "download";
  const m = (mime ?? "").toLowerCase();
  const path = url.split("?")[0].toLowerCase();

  if (m.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(path)) {
    return "image";
  }
  if (m.includes("pdf") || path.endsWith(".pdf")) return "pdf";
  return "download";
}

export function sketchLabel(
  mime: string | null,
  label: string | null,
  url?: string | null,
): string {
  if (label && !/\.[a-z0-9]{2,5}$/i.test(label)) return label;
  const kind = getSketchKind(mime, url ?? null);
  if (kind === "image") return "Croqui (imagem)";
  if (kind === "pdf") return "Croqui / briefing (PDF)";
  if (mime?.includes("presentation") || mime?.includes("powerpoint")) {
    return "Croqui / briefing (PPT)";
  }
  return label ?? "Descarregar documento";
}
