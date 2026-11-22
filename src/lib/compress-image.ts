/**
 * Shrinks photos in the browser before they are uploaded to Supabase Storage.
 *
 * Camera photos are often 10–25 MB. Before upload we resize the longest side to
 * MAX_EDGE px and re-encode as WebP (JPEG if the browser can't encode WebP).
 * Non-images (PDFs, videos), SVGs, GIFs and files that are already small pass
 * through unchanged, and if compression fails or doesn't help, the original is used.
 */

const MAX_EDGE = 2560;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 400 * 1024;
const COMPRESSIBLE = /^image\/(jpeg|jpg|png|webp|heic|heif|avif)$/i;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function compressImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!COMPRESSIBLE.test(file.type) || file.size < SKIP_BELOW_BYTES) return file;

  try {
    const source = await decode(file);
    const w = "naturalWidth" in source ? source.naturalWidth : source.width;
    const h = "naturalHeight" in source ? source.naturalHeight : source.height;
    if (!w || !h) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    if ("close" in source) source.close();

    let blob = await toBlob(canvas, "image/webp");
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/jpeg");
      ext = "jpg";
    }
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^/.]+$/, "") || "image";
    return new File([blob], `${base}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } catch (err) {
    console.warn("[compressImage] using original file:", err);
    return file;
  }
}

/** File extension for an (optionally compressed) file. */
export const fileExt = (file: File) => file.name.split(".").pop()?.toLowerCase() || "bin";
