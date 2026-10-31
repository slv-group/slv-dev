import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyers-guide")({
  head: () => ({
    meta: [
      { title: "Home Buyer's Guide — SLV Group" },
      {
        name: "description",
        content:
          "A comprehensive guide to buying property in Andhra Pradesh — covering RERA verification, home loan financing, registration, legal due diligence, and property handover.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "Home Buyer's Guide — SLV Group" },
      {
        property: "og:description",
        content: "A step-by-step guide to buying property and open plots with confidence.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/buyers-guide" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Home Buyer's Guide — SLV Group" },
      {
        name: "twitter:description",
        content: "A step-by-step guide to buying property and open plots with confidence.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/buyers-guide",
      },
    ],
  }),
  component: BuyersGuide,
});

const steps = [
  {
    q: "1. Define Your Requirements",
    a: "Begin by clarifying your budget, preferred configuration, location, and timeline. Our relationship managers help you shortlist residences that match your lifestyle and investment goals.",
  },
  {
    q: "2. Verify RERA & Legal Titles",
    a: "Every SLV project is RERA-registered with clear, marketable titles. We provide complete documentation — approvals, encumbrance certificates, and sanction plans — for transparent due diligence.",
  },
  {
    q: "3. Arrange Home Financing",
    a: "Use our EMI Calculator to plan your finances, then choose from our network of partner banks offering pre-approved loans with competitive interest rates and fast disbursal.",
  },
  {
    q: "4. Booking & Agreement",
    a: "Reserve your residence with a booking amount. We execute a transparent sale agreement detailing payment schedules, specifications, and possession timelines — with no hidden clauses.",
  },
  {
    q: "5. Registration & Stamp Duty",
    a: "On completion of payments, the property is registered in your name. We guide you through stamp duty, registration charges, and statutory formalities end to end.",
  },
  {
    q: "6. Handover & Possession",
    a: "Receive your keys after a joint quality inspection. Our post-handover team supports you with move-in coordination, warranties, and ongoing community services.",
  },
];

const faqs = [
  {
    q: "What does SLV Group specialize in?",
    a: "SLV specializes in developing high-quality properties in prime locations, offering luxurious urban living at affordable prices.",
    category: "About SLV",
  },
  {
    q: "What kind of properties does SLV Group build?",
    a: "SLV builds residential properties that feature cutting-edge functional and architectural designs, using high-quality materials.",
    category: "Properties",
  },
  {
    q: "Where are SLV Group' properties located?",
    a: "SLV properties are strategically located in prime areas, ensuring convenience and accessibility to urban amenities.",
    category: "Location",
  },
  {
    q: "What makes SLV Group different from other developers?",
    a: "SLV stands out for its focus on quality, innovative design, and affordability, making urban luxury accessible to a wider audience.",
    category: "About SLV",
  },
  {
    q: "What are the key features of SLV Group' properties?",
    a: "SLV properties are equipped with state-of-the-art facilities, ensuring modern comforts and a sophisticated living experience.",
    category: "Properties",
  },
  {
    q: "How does SLV Group ensure quality in its projects?",
    a: "SLV maintains high standards by using top-notch materials and engaging in meticulous craftsmanship throughout the construction process.",
    category: "Quality",
  },
  {
    q: "Does SLV Group offer customization options for properties?",
    a: "Yes, SLV provides customization options to meet individual preferences and ensure personalized living spaces.",
    category: "Properties",
  },
  {
    q: "What are the amenities available in SLV Group' properties?",
    a: "SLV properties include amenities such as swimming pools, fitness centers, landscaped gardens, and community spaces.",
    category: "Amenities",
  },
  {
    q: "Does SLV Group offer after-sales support?",
    a: "Yes, SLV provides comprehensive after-sales support to address any maintenance or service needs post-purchase.",
    category: "Support",
  },
  {
    q: "Are SLV Group' properties environmentally friendly?",
    a: "SLV integrates sustainable practices into its projects, promoting energy efficiency and environmental responsibility.",
    category: "Sustainability",
  },
  {
    q: "Can investors purchase properties from SLV Group?",
    a: "Yes, SLV offers investment opportunities in its properties, catering to both homeowners and investors alike.",
    category: "Investment",
  },
  {
    q: "Does SLV Group have a transparent pricing policy?",
    a: "Yes, SLV adheres to a transparent pricing policy, ensuring clarity and trust in all financial transactions.",
    category: "Pricing",
  },
  {
    q: "How can I contact SLV Group for more information?",
    a: "You can contact SLV through their website, email, or phone for detailed inquiries and consultation.",
    category: "Contact",
  },
  {
    q: "Does SLV Group have any ongoing projects?",
    a: "Yes, SLV continually launches new projects in sought-after locations, providing diverse options for homebuyers.",
    category: "Projects",
  },
  {
    q: "Is SLV Group involved in community initiatives?",
    a: "Yes, SLV actively participates in community development initiatives, contributing to the overall welfare of its surroundings.",
    category: "Community",
  },
];

function BuyersGuide() {
  const [openStep, setOpenStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* ── Hero Header ── */}
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card neu text-gold">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="section-label mt-6 text-gold">Buyer's Guide</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
            Buy With Confidence
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A clear, six-step journey from first enquiry to the day you hold your keys.
          </p>
        </div>

        {/* ── Six Steps Accordion ── */}
        <div className="mt-12 space-y-3">
          {steps.map((s, i) => (
            <div key={s.q} className="overflow-hidden rounded-2xl bg-card neu-sm">
              <button
                id={`step-${i + 1}`}
                onClick={() => setOpenStep(openStep === i ? -1 : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-display text-lg font-semibold text-foreground">{s.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gold transition-transform duration-300",
                    openStep === i && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  openStep === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 leading-relaxed text-muted-foreground">{s.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Decorative Gold Divider ── */}
        <div className="mt-20 mb-16 flex flex-col items-center gap-4">
          <div className="hairline-gold w-full" />
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card neu text-gold">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent via-gold/60 to-transparent" />
          </div>
          <div className="hairline-gold w-full" />
        </div>

        {/* ── FAQ Section Header ── */}
        <div className="text-center">
          <p className="section-label text-gold">Frequently Asked Questions</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-5xl">
            Got Questions?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Find answers about SLV Group' projects, policies, and processes — directly from the
            source.
          </p>
        </div>

        {/* ── FAQ Stats Bar ── */}
        <div className="mt-10 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl bg-card neu">
          {[
            { label: "Questions Answered", value: "15" },
            { label: "Years of Trust", value: "10+" },
            { label: "Projects Delivered", value: "20+" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-5 px-4 text-center">
              <span className="font-display text-2xl font-bold text-gradient-gold">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── FAQ Accordion ── */}
        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className={cn(
                "group overflow-hidden rounded-2xl border transition-all duration-300",
                openFaq === i
                  ? "border-gold/40 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                  : "border-border bg-card neu-sm hover:border-gold/20",
              )}
            >
              <button
                id={`faq-${i + 1}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-start gap-4 px-6 py-5 text-left"
              >
                {/* Number badge */}
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                    openFaq === i
                      ? "bg-gradient-gold text-gold-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-gradient-gold group-hover:text-gold-foreground",
                  )}
                >
                  {i + 1}
                </span>

                <div className="flex-1">
                  <span
                    className={cn(
                      "font-display text-base font-semibold leading-snug transition-colors duration-200",
                      openFaq === i
                        ? "text-gold"
                        : "text-foreground group-hover:text-foreground/90",
                    )}
                  >
                    {faq.q}
                  </span>
                  {/* Category pill */}
                  <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {faq.category}
                  </span>
                </div>

                <ChevronDown
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300",
                    openFaq === i ? "rotate-180 text-gold" : "text-muted-foreground",
                  )}
                />
              </button>

              {/* Answer */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex gap-4 px-6 pb-6">
                    {/* Left accent line */}
                    <div className="ml-11 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-gold/60 to-transparent" />
                    <p className="leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Footer ── */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-royal p-px">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-card px-8 py-10 text-center sm:flex-row sm:text-left">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-3xl" />
            <div className="relative flex-1">
              <p className="section-label text-gold">Still have questions?</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                Talk to Our Experts
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our relationship managers are available to guide you through every step of your home
                buying journey.
              </p>
            </div>
            <div className="relative flex shrink-0 flex-col gap-2.5 sm:items-end">
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="tel:+919859595939"
                  id="cta-call-experts"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-xs sm:text-sm font-semibold text-gold-foreground shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                >
                  📞 +91 98595 95939
                </a>
                <a
                  href="tel:+919459823444"
                  id="cta-call-experts-2"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-xs sm:text-sm font-semibold text-gold-foreground shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                >
                  📞 +91 94598 23444
                </a>
              </div>
              <a
                href="mailto:info@slvgroup.co.in"
                id="cta-email-experts"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 px-6 py-2.5 text-xs sm:text-sm font-medium text-foreground transition-all duration-200 hover:border-gold/60 hover:bg-gold/5"
              >
                ✉ info@slvgroup.co.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
