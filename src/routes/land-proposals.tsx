import { createFileRoute } from "@tanstack/react-router";
import {
  WorkRegistrationForm,
  type SectionConfig,
} from "@/components/registration/WorkingRegistrationForm";

export const Route = createFileRoute("/land-proposals")({
  component: LandProposals,
});

const sections: SectionConfig[] = [
  {
    title: "Owner / Proposer Details",
    fields: [
      {
        name: "owner_name",
        label: "Owner / Proposer Name",
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
        name: "registered_address",
        label: "Current Address",
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
      {
        name: "pin_code",
        label: "PIN Code",
        required: true,
      },
    ],
  },

  {
    title: "Land Details",
    fields: [
      {
        name: "land_location",
        label: "Land Location / Address",
        required: true,
      },
      {
        name: "land_area",
        label: "Total Land Area (in Sq. Ft / Acres)",
        required: true,
      },
      {
        name: "land_type",
        label: "Type of Land",
        type: "select",
        required: true,
        options: [
          "Residential Plot",
          "Commercial Plot",
          "Agricultural Land",
          "Industrial Land",
          "Mixed Use",
          "Other",
        ],
      },
      {
        name: "land_facing",
        label: "Land Facing",
        type: "select",
        required: true,
        options: [
          "East",
          "West",
          "North",
          "South",
          "North-East",
          "North-West",
          "South-East",
          "South-West",
        ],
      },
      {
        name: "road_width",
        label: "Road Width (in Feet)",
        required: true,
      },
      {
        name: "expected_price",
        label: "Expected Price (₹)",
        required: true,
      },
      {
        name: "survey_number",
        label: "Survey Number / Plot Number",
        required: true,
      },
      {
        name: "additional_details",
        label: "Additional Details / Remarks",
        type: "textarea",
        required: false,
      },
    ],
  },

  {
    title: "Document Uploads",
    description:
      "Upload your Land Documents, EC (Encumbrance Certificate), Patta / Chitta, Survey Map, Sale Deed, and any other relevant documents. Multiple PDF, JPG, or PNG files are supported.",
    fields: [
      {
        name: "documents",
        label: "Upload Documents",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png,image/*",
        multiple: true,
        required: true,
      },
    ],
  },
];

function LandProposals() {
  return (
    <WorkRegistrationForm
      title="Land Proposals"
      subtitle="Submit your land proposal to SLV Group for potential development opportunities."
      registrationType="land_proposal"
      sections={sections}
      submitLabel="Submit Proposal"
    />
  );
}
