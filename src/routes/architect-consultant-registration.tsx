import { createFileRoute } from "@tanstack/react-router";
import {
  WorkRegistrationForm,
  type SectionConfig,
} from "@/components/registration/WorkingRegistrationForm";

export const Route = createFileRoute("/architect-consultant-registration")({
  component: ArchitectConsultantRegistration,
});

const sections: SectionConfig[] = [
  {
    title: "Personal Details",
    fields: [
      {
        name: "full_name",
        label: "Full Name",
        required: true,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: ["Male", "Female", "Other"],
      },
      {
        name: "date_of_birth",
        label: "Date of Birth",
        type: "date",
      },
      {
        name: "mobile_number",
        label: "Mobile Number",
        type: "tel",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
      },
      {
        name: "aadhaar",
        label: "Aadhaar (Optional)",
      },
    ],
  },

  {
    title: "Professional Information",
    fields: [
      {
        name: "profession",
        label: "Profession",
        type: "select",
        required: true,
        options: ["Architect", "Civil Engineer", "Interior Designer", "Other"],
      },
      {
        name: "coa_registration",
        label: "COA Registration No.",
      },
      {
        name: "experience",
        label: "Experience (Years)",
        type: "number",
        required: true,
      },
      {
        name: "specialization",
        label: "Specialization",
        required: true,
      },
    ],
  },

  {
    title: "Office Address",
    fields: [
      {
        name: "address",
        label: "Full Address",
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
    title: "Document Uploads",
    description:
      "Upload your COA certificate, PAN/Aadhaar ID proof, and portfolio (optional). Multiple PDF, JPG, or PNG files are supported.",
    fields: [
      {
        name: "documents",
        label: "Documents",
        type: "file",
        accept: ".pdf,image/*",
        multiple: true,
        required: true,
      },
    ],
  },
];

function ArchitectConsultantRegistration() {
  return (
    <WorkRegistrationForm
      title="Architect & Consultant Registration"
      subtitle="Partner with SLV Group to showcase your expertise."
      registrationType="architect_consultant"
      sections={sections}
      submitLabel="Register Now"
    />
  );
}
