import { put } from "@vercel/blob";
import { hasBlobStorage } from "../challenger/upload";

export { hasBlobStorage };

export const CNC_IMAGE_ACCEPT =
  ".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

export const CNC_FILE_ACCEPT =
  ".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,image/*,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export async function uploadCncAsset(
  year: string,
  slot: string,
  file: File,
): Promise<{ url: string; mime: string; filename: string }> {
  if (!hasBlobStorage()) {
    throw new Error(
      "Armazenamento de ficheiros indisponível. Ligue um Blob store ao projeto na Vercel (Storage → Blob).",
    );
  }

  const safeSlot = slot.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`cnc/${year}/${safeSlot}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    mime: file.type || "application/octet-stream",
    filename: file.name,
  };
}
