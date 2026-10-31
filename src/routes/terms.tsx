import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ShieldAlert, CheckCircle, Scale } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — SLV Group" },
      {
        name: "description",
        content:
          "Terms and Conditions governing the use of SLV Group's official website, property listings, and digital services.",
      },
      { property: "og:title", content: "Terms and Conditions — SLV Group" },
      {
        property: "og:description",
        content: "Website terms and conditions for SLV Group.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/terms" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/terms",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            <Scale className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: October 2026 · SLV Group Official Website
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              By accessing, browsing, or using the website of SLV Group (
              <a href="https://www.slvgroup.co.in" className="text-gold underline">
                https://www.slvgroup.co.in
              </a>
              ), you acknowledge that you have read, understood, and agreed to be bound by these
              Terms and Conditions and our Privacy Policy. If you do not agree to these terms,
              please discontinue using the website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              2. Nature of Website Content
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              All information, images, renderings, specifications, floor plans, pricing estimates,
              and project descriptions provided on this website are for general informational and
              marketing purposes only. Nothing on this website constitutes a binding offer of sale,
              contract, or legal guarantee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              3. Enquiries, Bookings, and Site Visits
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Submitting an enquiry or requesting a site visit through this website represents an
              expression of interest and does not constitute a confirmed allotment, property
              reservation, or financial transaction. Formal property purchases and agreements are
              executed exclusively through signed physical documentation and legal agreements
              conforming to applicable statutory requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              4. Intellectual Property Rights
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              All content on this website—including but not limited to brand names, logos,
              architectural layouts, elevations, photographs, graphics, text, and software code—is
              the intellectual property of SLV Group or its licensors and is protected by Indian
              copyright, trademark, and intellectual property laws. Unauthorized copying,
              reproduction, or distribution is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              5. Project Specifications and Regulatory Approvals
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Project layouts, unit dimensions, amenities, and delivery schedules are subject to
              change in accordance with approvals from relevant urban development authorities,
              municipal corporations, and statutory bodies. Prospective buyers are advised to verify
              individual project RERA registration details, approved plans, and sanction orders
              prior to making any commitments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              6. Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              To the fullest extent permitted by applicable law, SLV Group, its partners, directors,
              and employees shall not be liable for any direct, indirect, incidental, or
              consequential damages arising from the use of, or inability to use, this website or
              any reliance placed on the information published herein.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              7. Governing Law and Jurisdiction
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              These Terms and Conditions shall be governed by and construed in accordance with the
              laws of the Republic of India. Any disputes arising out of or related to the use of
              this website shall be subject to the exclusive jurisdiction of the competent courts in
              Andhra Pradesh, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              8. Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              For any questions regarding these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm space-y-1">
              <p>
                <strong>SLV Group</strong>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:info@slvgroup.co.in" className="text-gold underline">
                  info@slvgroup.co.in
                </a>
              </p>
              <p>Phone: +91 98595 95939</p>
              <p>
                Address: Ground Floor, SLV Tummala Complex, Opp. SLV PNB Commercial, Gunadala,
                Inner Ring Road, Vijayawada, NTR District, Andhra Pradesh – 520004.
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
