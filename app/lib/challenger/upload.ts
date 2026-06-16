import { put } from "@vercel/blob";

export async function uploadChallengerSketch(
  year: string,
  provaId: string,
  file: File,
): Promise<{ url: string; mime: string; label: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Armazenamento de ficheiros indisponível. Configure BLOB_READ_WRITE_TOKEN na Vercel (Storage → Blob) ou indique um URL manual.",
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`challenger/${year}/${provaId}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    mime: file.type || "application/octet-stream",
    label: file.name,
  };
}
