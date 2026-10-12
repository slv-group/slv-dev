import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Award = Tables<"awards">;
export type AwardInsert = TablesInsert<"awards">;
export type AwardUpdate = TablesUpdate<"awards">;

export async function uploadAwardImage(file: File, year?: number | null): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const yearFolder = year ? String(year) : "general";

  const path = `awards/${yearFolder}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("award-media").upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "31536000",
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("award-media").getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteAwardImage(imageUrl: string) {
  if (!imageUrl) return;

  const marker = "/storage/v1/object/public/award-media/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) return;

  const storagePath = decodeURIComponent(imageUrl.substring(index + marker.length));

  const { error } = await supabase.storage.from("award-media").remove([storagePath]);

  if (error) {
    console.error("Failed to delete award image:", error);
  }
}
