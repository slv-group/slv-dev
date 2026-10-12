import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CSR = Tables<"csr_activities">;
export type CSRInsert = TablesInsert<"csr_activities">;
export type CSRUpdate = TablesUpdate<"csr_activities">;

export async function uploadCSRImage(file: File, year?: number | null): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const yearFolder = year ? String(year) : "general";

  const path = `csr/${yearFolder}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("CSR-media").upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "31536000",
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("CSR-media").getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteCSRImage(imageUrl: string) {
  if (!imageUrl) return;

  const marker = "/storage/v1/object/public/CSR-media/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) return;

  const storagePath = decodeURIComponent(imageUrl.substring(index + marker.length));

  const { error } = await supabase.storage.from("CSR-media").remove([storagePath]);

  if (error) {
    console.error("Failed to delete CSR image:", error);
  }
}
