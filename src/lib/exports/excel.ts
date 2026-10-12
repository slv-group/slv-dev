import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
type Registration = Tables<"work_registrations">;
import { createDocumentUrls } from "./documentUrls";
import { formatFieldName } from "@/routes/admin/messages";

const registrationLabels: Record<string, string> = {
  architect_consultant: "Architect & Consultant",
  contractor: "Contractor",
  vendor_supplier: "Vendor & Supplier",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export function formatExportValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function flattenFormData(registrations: Registration[]): string[] {
  const keys = new Set<string>();

  registrations.forEach((registration) => {
    const formData = (registration.form_data ?? {}) as Record<string, unknown>;

    Object.keys(formData).forEach((key) => {
      keys.add(key);
    });
  });

  return Array.from(keys).sort();
}

export async function exportRegistrationsToExcel(registrations: Registration[]) {
  if (!registrations.length) {
    toast.error("There are no applications to export.");
    return;
  }

  const toastId = toast.loading("Preparing Excel export...");

  try {
    const formDataKeys = flattenFormData(registrations);
    const documents = await createDocumentUrls(registrations);

    /*
     * ------------------------------------------------------------
     * APPLICATIONS SHEET
     * ------------------------------------------------------------
     */

    const applicationsRows = registrations.map((registration) => {
      const formData = (registration.form_data ?? {}) as Record<string, unknown>;

      const documentPaths = (registration.document_paths ?? {}) as Record<string, string>;

      const row: Record<string, string | number | boolean> = {
        ID: registration.id,
        "Applicant Name": registration.applicant_name,
        Email: registration.email,
        Phone: registration.phone,
        "Registration Type":
          registrationLabels[registration.registration_type] ?? registration.registration_type,
        Status: statusLabels[registration.status] ?? registration.status,
        Viewed: registration.viewed ? "Yes" : "No",
        "Created At": new Date(registration.created_at).toLocaleString(),
        "Updated At": registration.updated_at
          ? new Date(registration.updated_at).toLocaleString()
          : "",
        "Document Count": Object.keys(documentPaths).length,
      };

      /*
       * Dynamic form fields
       */
      formDataKeys.forEach((key) => {
        row[formatFieldName(key)] = formatExportValue(formData[key]);
      });

      return row;
    });

    /*
     * ------------------------------------------------------------
     * DOCUMENTS SHEET
     * ------------------------------------------------------------
     */

    const documentRows = documents.map((document) => ({
      "Registration ID": document.registrationId,
      "Applicant Name": document.applicantName,
      "Document Name": formatFieldName(document.documentName),
      "Storage Path": document.storagePath,
      "Asset URL": document.url,
    }));

    /*
     * ------------------------------------------------------------
     * WORKBOOK
     * ------------------------------------------------------------
     */

    const workbook = XLSX.utils.book_new();

    const applicationsSheet = XLSX.utils.json_to_sheet(applicationsRows);

    const documentsSheet = XLSX.utils.json_to_sheet(documentRows);

    documentsSheet["!cols"] = [{ wch: 38 }, { wch: 25 }, { wch: 25 }, { wch: 55 }, { wch: 90 }];

    /*
     * Make Asset URL cells clickable
     */
    const documentsRange = XLSX.utils.decode_range(documentsSheet["!ref"] ?? "A1:E1");

    for (let row = documentsRange.s.r + 1; row <= documentsRange.e.r; row++) {
      const urlCellAddress = XLSX.utils.encode_cell({
        r: row,
        c: 4, // Column E = Asset URL
      });

      const cell = documentsSheet[urlCellAddress];

      if (cell && typeof cell.v === "string" && cell.v.startsWith("http")) {
        cell.l = {
          Target: cell.v,
          Tooltip: "Open document",
        };

        // Optional: make it look like a hyperlink
        cell.s = {
          font: {
            color: { rgb: "0563C1" },
            underline: true,
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, applicationsSheet, "Applications");

    XLSX.utils.book_append_sheet(workbook, documentsSheet, "Documents");

    const fileName = `SLV_Work_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    toast.success(`Excel exported successfully: ${registrations.length} applications`, {
      id: toastId,
    });
  } catch (error) {
    console.error(error);

    toast.error("Unable to export Excel file.", {
      id: toastId,
    });
  }
}
