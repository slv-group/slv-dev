import { createFileRoute } from "@tanstack/react-router";
import {
  WorkRegistrationForm,
  type SectionConfig,
} from "@/components/registration/WorkingRegistrationForm";

export const Route = createFileRoute("/contractor-registration")({
  component: ContractorRegistration,
});

const sections: SectionConfig[] = [
  {
    title: "Company Details",
    fields: [
      {
        name: "company_firm_name",
        label: "Company / Firm Name",
        required: true,
      },
      {
        name: "contact_person",
        label: "Contact Person",
        required: true,
      },
      {
        name: "mobile_number",
        label: "Mobile Number",
        type: "tel",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        name: "landline",
        label: "Landline (Optional)",
      },
    ],
  },

  {
    title: "Service Details",
    fields: [
      {
        name: "contractor_type",
        label: "Contractor Type",
        type: "select",
        required: true,
        options: [
          "Civil Construction",
          "Electrical",
          "Plumbing",
          "HVAC",
          "Interior Finishing",
          "Structural Work",
          "Landscape",
          "Other",
        ],
      },
      {
        name: "experience",
        label: "Years of Experience",
        type: "select",
        required: true,
        options: ["1-3 Years", "3-5 Years", "5-10 Years", "10+ Years"],
      },
      {
        name: "team_size",
        label: "Team Size",
        type: "select",
        required: true,
        options: ["1-10 Workers", "10-25 Workers", "25-50 Workers", "50+ Workers"],
      },
      {
        name: "notable_projects",
        label: "Notable Projects (Brief Description)",
        type: "textarea",
      },
    ],
  },

  {
    title: "Document Uploads",
    description:
      "Upload your COA certificate, PAN/Aadhaar ID proof, and portfolio (optional). Multiple PDF, JPG, or PNG files are supported.",
    fields: [
      {
        name: "documents",
        label: "Upload Documents",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf",
        required: true,
        multiple: true,
      },
    ],
  },
];

function ContractorRegistration() {
  return (
    <WorkRegistrationForm
      title="Contractor Registration"
      subtitle="Partner with SLV Group for premium construction projects."
      registrationType="contractor"
      sections={sections}
      submitLabel="Apply as Contractor"
    />
  );
}
