import { put } from "@vercel/blob";

/** Vercel Blob: token clássico ou OIDC (BLOB_STORE_ID na Vercel). */
export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function uploadChallengerSketch(
  year: string,
  provaId: string,
  file: File,
): Promise<{ url: string; mime: string; label: string }> {
  if (!hasBlobStorage()) {
    throw new Error(
      "Armazenamento de ficheiros indisponível. Ligue um Blob store ao projeto na Vercel (Storage → Blob).",
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
