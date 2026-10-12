import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

import { createDocumentUrls } from "./documentUrls";
import { formatFieldName } from "@/routes/admin/messages";
import { formatExportValue } from "./excel";

type Registration = Tables<"work_registrations">;

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

export async function exportRegistrationsToPDF(registrations: Registration[]) {
  if (!registrations.length) {
    toast.error("There are no applications to export.");
    return;
  }

  const toastId = toast.loading("Preparing PDF export...");

  try {
    /*
     * ------------------------------------------------------------
     * CREATE PERMANENT DOCUMENT URLS
     * ------------------------------------------------------------
     */
    const documents = await createDocumentUrls(registrations);

    /*
     * ------------------------------------------------------------
     * CREATE PDF
     * ------------------------------------------------------------
     */
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    /*
     * ------------------------------------------------------------
     * TITLE
     * ------------------------------------------------------------
     */
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);

    pdf.text("SLV Group", 14, 16);

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");

    pdf.text("Work Registration Applications", 14, 24);

    pdf.setFontSize(9);
    pdf.setTextColor(100);

    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 31);

    pdf.text(`Total Applications: ${registrations.length}`, 14, 36);

    pdf.setTextColor(0, 0, 0);

    /*
     * ------------------------------------------------------------
     * APPLICATION SUMMARY TABLE
     * ------------------------------------------------------------
     */
    const summaryRows = registrations.map((registration) => [
      registration.applicant_name,
      registration.email,
      registration.phone,
      registrationLabels[registration.registration_type] ?? registration.registration_type,
      statusLabels[registration.status] ?? registration.status,
      new Date(registration.created_at).toLocaleDateString(),
    ]);

    autoTable(pdf, {
      startY: 43,
      head: [["Applicant", "Email", "Phone", "Registration Type", "Status", "Submitted"]],
      body: summaryRows,
      styles: {
        fontSize: 7,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
    });

    /*
     * ------------------------------------------------------------
     * INDIVIDUAL APPLICATION DETAILS
     * ------------------------------------------------------------
     */
    for (const registration of registrations) {
      pdf.addPage();

      /*
       * Header
       */
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);

      pdf.text(registration.applicant_name, 14, 16);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text(`Application ID: ${registration.id}`, 14, 23);

      pdf.text(
        `Registration Type: ${
          registrationLabels[registration.registration_type] ?? registration.registration_type
        }`,
        14,
        29,
      );

      pdf.text(`Status: ${statusLabels[registration.status] ?? registration.status}`, 14, 35);

      /*
       * ----------------------------------------------------------
       * CONTACT INFORMATION
       * ----------------------------------------------------------
       */
      const contactRows = [
        ["Applicant Name", registration.applicant_name],
        ["Email", registration.email],
        ["Phone", registration.phone],
        ["Submitted", new Date(registration.created_at).toLocaleString()],
        [
          "Updated",
          registration.updated_at ? new Date(registration.updated_at).toLocaleString() : "—",
        ],
        ["Viewed", registration.viewed ? "Yes" : "No"],
      ];

      autoTable(pdf, {
        startY: 42,
        head: [["Contact / Application Field", "Value"]],
        body: contactRows,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [35, 35, 35],
          textColor: [255, 255, 255],
        },
        columnStyles: {
          0: {
            cellWidth: 55,
          },
        },
      });

      /*
       * ----------------------------------------------------------
       * DYNAMIC FORM FIELDS
       * ----------------------------------------------------------
       */
      const formData = (registration.form_data ?? {}) as Record<string, unknown>;

      const formRows = Object.entries(formData).map(([key, value]) => [
        formatFieldName(key),
        formatExportValue(value),
      ]);

      if (formRows.length) {
        const lastY = (pdf as any).lastAutoTable?.finalY ?? 50;

        autoTable(pdf, {
          startY: lastY + 8,
          head: [["Application Details", "Value"]],
          body: formRows,
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: [212, 175, 55],
            textColor: [0, 0, 0],
          },
        });
      }

      /*
       * ----------------------------------------------------------
       * DOCUMENTS
       * ----------------------------------------------------------
       */
      const registrationDocuments = documents.filter(
        (document) => document.registrationId === registration.id,
      );

      if (registrationDocuments.length) {
        const lastY = (pdf as any).lastAutoTable?.finalY ?? 50;

        autoTable(pdf, {
          startY: lastY + 8,

          head: [["Document", "Storage Path", "Download"]],

          body: registrationDocuments.map((document) => [
            formatFieldName(document.documentName),
            document.storagePath,
            "Open Document",
          ]),

          styles: {
            fontSize: 6,
            cellPadding: 3,
            overflow: "linebreak",
          },

          headStyles: {
            fillColor: [35, 35, 35],
            textColor: [255, 255, 255],
          },

          columnStyles: {
            0: {
              cellWidth: 45,
            },
            1: {
              cellWidth: 95,
            },
            2: {
              cellWidth: 45,
            },
          },

          /*
           * Create clickable PDF links.
           */
          didDrawCell: (data: any) => {
            if (data.section !== "body" || data.column.index !== 2) {
              return;
            }

            const document = registrationDocuments[data.row.index];

            if (!document?.url) {
              return;
            }

            /*
             * Create clickable area.
             */
            pdf.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url: document.url,
            });

            /*
             * Draw blue clickable text.
             */
            pdf.setTextColor(30, 90, 200);

            pdf.setFontSize(6);

            pdf.text("Open Document", data.cell.x + 3, data.cell.y + data.cell.height / 2 + 1.5);

            pdf.setTextColor(0, 0, 0);
          },
        });
      }
    }

    /*
     * ------------------------------------------------------------
     * SAVE ONLY ONCE
     * ------------------------------------------------------------
     */
    const fileName = `SLV_Work_Registrations_${new Date().toISOString().slice(0, 10)}.pdf`;

    pdf.save(fileName);

    toast.success(`PDF exported successfully: ${registrations.length} applications`, {
      id: toastId,
    });
  } catch (error) {
    console.error("PDF export failed:", error);

    toast.error("Unable to export PDF file.", {
      id: toastId,
    });
  }
}
