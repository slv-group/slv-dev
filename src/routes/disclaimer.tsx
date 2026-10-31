import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Statutory Disclaimer & RERA Disclosures — SLV Group" },
      {
        name: "description",
        content:
          "Important statutory disclosures, RERA information, and artistic rendering notices for SLV Group real estate projects.",
      },
      { property: "og:title", content: "Disclaimer — SLV Group" },
      {
        property: "og:description",
        content: "Statutory and RERA disclosures for SLV Group developments.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/disclaimer" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/disclaimer",
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            <AlertTriangle className="h-3.5 w-3.5" />
            Statutory Notice
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Important Information for Prospective Buyers & Website Visitors
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              1. Artistic Impressions and Visual Representations
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              All 3D renderings, floor layouts, mock-ups, artistic impressions, walkthrough videos,
              and images displayed on this website are conceptual in nature and intended solely to
              illustrate the proposed design and vision of the projects. The actual finish, color
              palette, fittings, landscaping, and materials used in the final construction may vary
              from what is shown in visual representations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              2. Project Specifications and Architectural Discretion
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              The developer reserves the right to make modifications, alterations, additions, or
              deletions in the specifications, floor layouts, master layouts, amenities, and
              elevation designs as deemed necessary by architects, structural engineers, or
              statutory authorities in accordance with applicable building regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              3. RERA & Statutory Compliance
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              SLV Group develops real estate projects in compliance with the Real Estate (Regulation
              and Development) Act, 2016 (RERA) and rules framed by the Andhra Pradesh Real Estate
              Regulatory Authority (AP RERA).
            </p>
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <p>
                <strong>Buyer Due Diligence:</strong> Prospective purchasers are expressly advised
                to independently review and verify all relevant details, including approved building
                plans, RERA registration numbers, land titles, and sanction orders from competent
                governmental authorities prior to entering into any agreement or making financial
                payments.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              4. Pricing, Area Dimensions, and Availability
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              All prices, unit availability, and area measurements (in sq ft, sq yards, or acres)
              quoted on this website are indicative and subject to change without prior notice. Area
              details are governed by the formal Agreement for Sale and RERA carpet area provisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              5. No Solicitation or Financial Advice
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              The information on this website does not constitute financial, investment, or legal
              advice. Users are advised to seek independent legal, financial, and real-estate
              counsel prior to entering into property transactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              6. Official Communication
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              SLV Group is not responsible for any information, commitments, or offers made by
              unauthorized third parties, external portals, or non-verified channel partners. For
              verified information, please contact our official marketing team at{" "}
              <a href="mailto:info@slvgroup.co.in" className="text-gold underline">
                info@slvgroup.co.in
              </a>{" "}
              or{" "}
              <a href="tel:+919859595939" className="text-gold underline">
                +91 98595 95939
              </a>{" "}
              /{" "}
              <a href="tel:+919459823444" className="text-gold underline">
                +91 94598 23444
              </a>
              .
            </p>
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
