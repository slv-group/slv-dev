import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Registration = Tables<"work_registrations">;

const PRIVATE_BUCKET = "registration-documents";
const PUBLIC_BUCKET = "export-attachments";

export type ExportDocument = {
  registrationId: string;
  applicantName: string;
  documentName: string;
  storagePath: string;
  url: string;
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
}

/**
 * Creates permanent public URLs for exported documents.
 *
 * Original files remain inside the private registration-documents bucket.
 * A copy is placed into the public export-attachments bucket.
 */
export async function createDocumentUrls(registrations: Registration[]): Promise<ExportDocument[]> {
  const documents: ExportDocument[] = [];

  for (const registration of registrations) {
    const documentPaths = (registration.document_paths ?? {}) as Record<string, string>;

    for (const [documentName, storagePath] of Object.entries(documentPaths)) {
      if (!storagePath) continue;

      try {
        /*
         * 1. Download from the PRIVATE bucket.
         */
        const { data: file, error: downloadError } = await supabase.storage
          .from(PRIVATE_BUCKET)
          .download(storagePath);

        if (downloadError || !file) {
          console.error(`Unable to download document: ${storagePath}`, downloadError);
          continue;
        }

        /*
         * 2. Create a stable export path.
         *
         * Using registration ID means repeated exports can reuse
         * the same public object instead of creating a new copy every time.
         */
        const originalFileName =
          storagePath.split("/").pop() || `${sanitizeFileName(documentName)}.file`;

        const safeFileName = sanitizeFileName(originalFileName);

        const exportPath = ["registrations", registration.id, safeFileName].join("/");

        /*
         * 3. Upload/copy into PUBLIC bucket.
         *
         * upsert:true means we don't keep creating duplicate files
         * on every export.
         */
        const { error: uploadError } = await supabase.storage
          .from(PUBLIC_BUCKET)
          .upload(exportPath, file, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error(`Unable to publish document: ${exportPath}`, uploadError);
          continue;
        }

        /*
         * 4. Get a PERMANENT public URL.
         */
        const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(exportPath);

        if (!data?.publicUrl) {
          console.error(`No public URL returned for ${exportPath}`);
          continue;
        }

        documents.push({
          registrationId: registration.id,
          applicantName: registration.applicant_name,
          documentName,
          storagePath,
          url: data.publicUrl,
        });
      } catch (error) {
        console.error(`Document export preparation failed for ${storagePath}`, error);
      }
    }
  }

  return documents;
}
