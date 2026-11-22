import { createFileRoute } from "@tanstack/react-router";
import {
  WorkRegistrationForm,
  type SectionConfig,
} from "@/components/registration/WorkingRegistrationForm";

export const Route = createFileRoute("/vendors-suppliers-registration")({
  head: () => ({
    meta: [
      { title: "Vendors & Suppliers Registration — SLV Group" },
      {
        name: "description",
        content:
          "Supply building materials or services? Register as an approved SLV Group vendor for our construction projects in Vijayawada and Andhra Pradesh.",
      },
      { property: "og:title", content: "Vendors & Suppliers Registration — SLV Group" },
      { property: "og:url", content: "https://www.slvgroup.co.in/vendors-suppliers-registration" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.slvgroup.co.in/vendors-suppliers-registration" },
    ],
  }),
  component: VendorSupplierRegistration,
});

const sections: SectionConfig[] = [
  {
    title: "Business Details",
    fields: [
      {
        name: "company_name",
        label: "Company Name",
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
        name: "city",
        label: "City",
        required: true,
      },
      {
        name: "state",
        label: "State",
        required: true,
      },
    ],
  },

  {
    title: "Supply Specialization",
    fields: [
      {
        name: "primary_supply_category",
        label: "Primary Supply Category",
        type: "select",
        required: true,
        className: "md:col-span-2",
        options: [
          "Cement & Concrete",
          "Steel & Metal",
          "Bricks & Blocks",
          "Sanitaryware",
          "Tiles & Stone",
          "Electrical Items",
          "Paints & Coatings",
          "Other",
        ],
      },
    ],
  },
];

function VendorSupplierRegistration() {
  return (
    <WorkRegistrationForm
      title="Vendor & Supplier Registration"
      subtitle="Join SLV Group's trusted network of material suppliers."
      registrationType="vendor_supplier"
      sections={sections}
      submitLabel="Submit Application"
    />
  );
}
