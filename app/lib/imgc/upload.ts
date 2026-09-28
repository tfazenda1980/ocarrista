import { put } from "@vercel/blob";
import { hasBlobStorage } from "../challenger/upload";

export { hasBlobStorage };

export const IMGC_IMAGE_ACCEPT =
  ".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif";

export const IMGC_FILE_ACCEPT =
  ".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export async function uploadImgcAsset(
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
  const blob = await put(`imgc/${year}/${safeSlot}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    mime: file.type || "application/octet-stream",
    filename: file.name,
  };
}

export function programmeSlot() {
  return "programme";
}

export function gallerySlot(id: string) {
  return `gallery:${id}`;
}
