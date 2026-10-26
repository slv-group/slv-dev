import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChevronDown,
  HelpCircle,
  Search,
  Sparkles,
  Phone,
  Mail,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions (FAQs) — SLV Group" },
      {
        name: "description",
        content:
          "Find answers to frequently asked questions about SLV Group properties, RERA compliance, payment plans, site visits, and amenities in Vijayawada & Amaravati.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "Frequently Asked Questions — SLV Group" },
      {
        property: "og:description",
        content: "Answers to questions about our residential communities and plotted developments.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/faq" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Frequently Asked Questions — SLV Group" },
      {
        name: "twitter:description",
        content: "Answers to questions about our residential communities and plotted developments.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/faq",
      },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "What does SLV Group specialize in?",
    a: "SLV Group specializes in developing high-quality properties in prime locations, offering luxurious urban living at affordable prices.",
    category: "General",
  },
  {
    q: "What kind of properties does SLV Group build?",
    a: "SLV Group builds residential properties that feature cutting-edge functional and architectural designs, using high-quality materials.",
    category: "Projects",
  },
  {
    q: "Where are SLV Group' properties located?",
    a: "SLV properties are strategically located in prime areas, ensuring convenience and accessibility to urban amenities.",
    category: "Locations",
  },
  {
    q: "What makes SLV Group different from other developers?",
    a: "SLV stands out for its focus on quality, innovative design, and affordability, making urban luxury accessible to a wider audience.",
    category: "General",
  },
  {
    q: "What are the key features of SLV Group' properties?",
    a: "SLV properties are equipped with state-of-the-art facilities, ensuring modern comforts and a sophisticated living experience.",
    category: "Amenities",
  },
  {
    q: "How does SLV Group ensure quality in its projects?",
    a: "SLV maintains high standards by using top-notch materials and engaging in meticulous craftsmanship throughout the construction process.",
    category: "Quality",
  },
  {
    q: "Does SLV Group offer customization options for properties?",
    a: "Yes, SLV provides customization options to meet individual preferences and ensure personalized living spaces.",
    category: "Customization",
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
    category: "General",
  },
];

const categories = [
  "All",
  "General",
  "Projects",
  "Locations",
  "Amenities",
  "Quality",
  "Support",
  "Pricing",
];

function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<number, "yes" | "no">>({});

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleFeedback = (index: number, type: "yes" | "no") => {
    setHelpfulFeedback((prev) => ({ ...prev, [index]: type }));
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header Section */}
        <div className="text-center animate-fade-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card neu text-gold animate-float">
            <HelpCircle className="h-7 w-7" />
          </span>
          <p className="section-label mt-6 text-gold">FAQ Center</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Clear, transparent answers about SLV Group' luxury residences, layout projects, quality
            standards, and policies.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-12 relative max-w-xl mx-auto animate-fade-up">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gold/60" />
          </div>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenFaq(null);
            }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card shadow-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300 placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gold hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-up stagger-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setOpenFaq(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300",
                selectedCategory === category
                  ? "bg-gradient-gold text-gold-foreground shadow-md scale-[1.04]"
                  : "bg-card border border-border text-muted-foreground hover:border-gold/30 hover:text-foreground neu-sm",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-10 space-y-4 animate-fade-up stagger-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => {
              const originalIndex = faqs.findIndex((f) => f.q === faq.q);
              return (
                <div
                  key={faq.q}
                  className={cn(
                    "group overflow-hidden rounded-2xl border transition-all duration-350",
                    openFaq === i
                      ? "border-gold/40 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                      : "border-border bg-card neu-sm hover:border-gold/30",
                  )}
                >
                  <button
                    id={`faq-btn-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-start gap-4 px-6 py-5 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                        openFaq === i
                          ? "bg-gradient-gold text-gold-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-gradient-gold group-hover:text-gold-foreground",
                      )}
                    >
                      {originalIndex + 1}
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
                      <span className="ml-2 inline-block rounded-full bg-muted/60 border border-border/40 px-2.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
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

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-4 px-6 pb-6">
                        <div className="flex gap-4">
                          <div className="ml-11 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-gold/60 to-transparent" />
                          <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
                            {faq.a}
                          </p>
                        </div>

                        {/* Interactive Helpfulness Feedback */}
                        <div className="ml-11 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                          <span>Was this answer helpful?</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFeedback(originalIndex, "yes")}
                              className={cn(
                                "flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all duration-200",
                                helpfulFeedback[originalIndex] === "yes"
                                  ? "bg-gold/10 border-gold/40 text-gold"
                                  : "border-border/60 hover:bg-muted/50 hover:text-foreground",
                              )}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Yes
                            </button>
                            <button
                              onClick={() => handleFeedback(originalIndex, "no")}
                              className={cn(
                                "flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all duration-200",
                                helpfulFeedback[originalIndex] === "no"
                                  ? "bg-destructive/10 border-destructive/40 text-destructive"
                                  : "border-border/60 hover:bg-muted/50 hover:text-foreground",
                              )}
                            >
                              <ThumbsDown className="h-3 w-3" />
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/50">
              <Sparkles className="mx-auto h-8 w-8 text-gold/40 mb-3" />
              <p className="text-foreground font-semibold">
                No questions found matching your search
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Try checking a different category or search term.
              </p>
            </div>
          )}
        </div>

        {/* Contact/CTA Card */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-royal p-px animate-fade-up">
          <div className="relative flex flex-col items-center gap-6 rounded-3xl bg-card px-8 py-10 text-center md:flex-row md:text-left">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-3xl" />

            <div className="relative flex-1">
              <span className="section-label text-gold">Still have questions?</span>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                Get In Touch With Us
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team and relation managers are here to assist you with any query
                regarding bookings, documentation, layout plans, or site visits.
              </p>
            </div>

            <div className="relative flex shrink-0 flex-col gap-3 w-full md:w-auto md:items-end">
              <a
                href="tel:+919859595939"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-gold-foreground shadow-md transition-all duration-250 hover:opacity-90 hover:scale-[1.02]"
              >
                <Phone className="h-4 w-4" />
                <span>+91 98595 95939</span>
              </a>
              <a
                href="mailto:info@slvgroup.co.in"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 px-6 py-3.5 text-sm font-medium text-foreground transition-all duration-250 hover:border-gold/60 hover:bg-gold/5"
              >
                <Mail className="h-4 w-4" />
                <span>info@slvgroup.co.in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
