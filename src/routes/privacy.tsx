import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, FileText, Mail, Eye, Server, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SLV Group" },
      {
        name: "description",
        content:
          "SLV Group Privacy Policy. Learn how we collect, use, protect, and handle your personal data in compliance with India's Digital Personal Data Protection Act, 2023.",
      },
      { property: "og:title", content: "Privacy Policy — SLV Group" },
      {
        property: "og:description",
        content:
          "Privacy policy explaining data collection, protection, and user rights at SLV Group.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/privacy" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/privacy",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            <Shield className="h-3.5 w-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated: October 2026 · Designed to align with the Digital Personal Data Protection
            Act, 2023 (India)
          </p>
        </div>

        {/* Notice for verification */}
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> This Privacy Policy represents SLV Group's current website data
          handling practices. Specific corporate entity registration numbers and named grievance
          officers are subject to final corporate review and legal sign-off.
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              SLV Group ("we", "our", or "us") respects your privacy and is committed to protecting
              the personal data you share with us. This Privacy Policy describes how we collect,
              process, store, and safeguard your personal information when you visit our website (
              <a href="https://www.slvgroup.co.in" className="text-gold underline">
                https://www.slvgroup.co.in
              </a>
              ) or interact with our digital forms and services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              2. Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We collect information that you voluntarily provide when using our website features,
              including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground sm:text-base">
              <li>
                <strong>Enquiries & Contact Forms:</strong> Name, phone number, email address,
                preferred project, and message details.
              </li>
              <li>
                <strong>Site Visit Requests:</strong> Full name, contact number, preferred date and
                time, and selected project destination.
              </li>
              <li>
                <strong>Careers & Job Applications:</strong> Full name, email, phone number, resume
                documents, professional background, and cover notes.
              </li>
              <li>
                <strong>Work Registrations (Architects, Contractors, Vendors):</strong> Business
                name, contact person details, GST/PAN credentials, past experience, and uploaded
                supporting documents.
              </li>
              <li>
                <strong>Land Proposals:</strong> Property owner/representative name, contact
                details, land location, extent/area, and survey documents.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> Browser type, operating system, IP address,
                and session identifiers collected via standard server logs.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              3. Purpose of Collection and Legal Grounds
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Under India's Digital Personal Data Protection Act, 2023 (DPDP Act), we process
              personal data based on your explicit consent and for legitimate business purposes,
              including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground sm:text-base">
              <li>Responding to property enquiries and scheduling personalized site visits.</li>
              <li>Providing project brochures, price quotations, and development updates.</li>
              <li>Evaluating and processing vendor, contractor, and consultant registrations.</li>
              <li>Reviewing career applications and conducting recruitment processes.</li>
              <li>
                Complying with statutory, legal, and regulatory requirements under Indian law.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              4. Data Storage and Security Controls
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We employ strict technical and organizational safeguards to protect your personal
              information:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground sm:text-base">
              <li>
                <strong>Database Row-Level Security (RLS):</strong> User submissions are stored in
                our Supabase cloud infrastructure protected by granular Row-Level Security policies.
                Public and unauthorized users cannot read private submissions.
              </li>
              <li>
                <strong>Private Storage Buckets:</strong> Sensitive documents such as resumes, PAN,
                GST, and registration files are stored in private storage buckets accessible only to
                authenticated administrative personnel.
              </li>
              <li>
                <strong>Encryption:</strong> Data in transit is protected using modern HTTPS / TLS
                encryption.
              </li>
              <li>
                <strong>Access Controls:</strong> Role-based access control (RBAC) ensures only
                authorized staff in relevant departments can access user records.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              5. Third-Party Service Providers
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We work with trusted enterprise cloud infrastructure providers to operate the
              platform:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground sm:text-base">
              <li>
                <strong>Supabase:</strong> Cloud database, authentication, and object storage.
              </li>
              <li>
                <strong>Vercel:</strong> Application hosting, edge network, and content delivery.
              </li>
              <li>
                <strong>Google Workspace:</strong> Corporate email communication and domain mail
                exchange.
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We do not sell, rent, or trade your personal data to third parties for marketing or
              advertising purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              6. Data Retention Policy
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We retain personal data only for as long as necessary to fulfill the purposes for
              which it was collected, resolve disputes, satisfy legitimate business needs, or comply
              with statutory retention mandates under applicable Indian laws and real-estate
              regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              7. Your Rights Under DPDP Act 2023
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              As a Data Principal, you have the following statutory rights regarding your personal
              data:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground sm:text-base">
              <li>
                <strong>Right to Access:</strong> Request a summary of personal data held about you.
              </li>
              <li>
                <strong>Right to Correction & Updating:</strong> Request correction of inaccurate,
                incomplete, or outdated information.
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your personal data when it is
                no longer necessary for the purpose it was collected.
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Withdraw previously given consent for
                data processing at any time.
              </li>
              <li>
                <strong>Right of Grievance Redressal:</strong> Submit a complaint regarding data
                handling.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              8. Contact Us & Grievance Redressal
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              If you have any questions about this Privacy Policy, wish to exercise your data
              rights, or wish to raise a privacy grievance, please reach out to us:
            </p>
            <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm space-y-2">
              <p>
                <strong>Company:</strong> SLV Group
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@slvgroup.co.in" className="text-gold underline">
                  info@slvgroup.co.in
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +91 98595 95939
              </p>
              <p>
                <strong>Office Address:</strong> 8-56-68/5, Beside Tenali Flyover, Sri Saila Nagar,
                Ward No.5, Mangalagiri, Guntur District, Andhra Pradesh, India.
              </p>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                Data Grievance Officer details will be formally published upon regulatory gazette
                notification under the DPDP Rules.
              </p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 border-t border-border pt-6">
          <Link to="/" className="text-sm font-medium text-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
