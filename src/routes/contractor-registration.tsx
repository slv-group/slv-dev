import { createFileRoute } from "@tanstack/react-router";
import {
  WorkRegistrationForm,
  type SectionConfig,
} from "@/components/registration/WorkingRegistrationForm";

export const Route = createFileRoute("/contractor-registration")({
  head: () => ({
    meta: [
      { title: "Contractor Registration — SLV Group" },
      {
        name: "description",
        content:
          "Register as an approved civil, electrical, plumbing, or infrastructure contractor with SLV Group.",
      },
      { property: "og:title", content: "Contractor Registration — SLV Group" },
      { property: "og:url", content: "https://www.slvgroup.co.in/contractor-registration" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.slvgroup.co.in/contractor-registration" }],
  }),
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
        className: "md:col-span-2",
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
