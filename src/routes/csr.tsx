import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  HandHeart,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// IMAGES
// Static assets imported via Vite. The resolveImageUrl() helper maps
// database paths (old /src/assets/… or new /assets/…) and full Supabase
// Storage URLs to the correct runtime src.
// -----------------------------------------------------------------------------
import heroImage from "@/assets/about_slv.jpg";
import annaCanteenImage from "@/assets/csr/anna-canteen-donation.png";
import communityImage from "@/assets/csr/community.jpg";
import csrPhoto1 from "@/assets/csr/photo_2026-08-23_23-01-15.jpg";
import csrPhoto2 from "@/assets/csr/photo_2026-08-23_23-01-19.jpg";
import csrPhoto3 from "@/assets/csr/photo_2026-08-23_23-01-22.jpg";
import csrPhoto4 from "@/assets/csr/photo_2026-08-23_23-01-26.jpg";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Map every known DB path variant → its Vite-imported asset
const imageMap: Record<string, string> = {
  "/src/assets/csr/anna-canteen-donation.png": annaCanteenImage,
  "/assets/csr/anna-canteen-donation.png": annaCanteenImage,
  "/src/assets/csr/community.jpg": communityImage,
  "/assets/csr/community.jpg": communityImage,
  "/src/assets/csr/photo_2026-08-23_23-01-15.jpg": csrPhoto1,
  "/assets/csr/photo_2026-08-23_23-01-15.jpg": csrPhoto1,
  "/src/assets/csr/photo_2026-08-23_23-01-19.jpg": csrPhoto2,
  "/assets/csr/photo_2026-08-23_23-01-19.jpg": csrPhoto2,
  "/src/assets/csr/photo_2026-08-23_23-01-22.jpg": csrPhoto3,
  "/assets/csr/photo_2026-08-23_23-01-22.jpg": csrPhoto3,
  "/src/assets/csr/photo_2026-08-23_23-01-26.jpg": csrPhoto4,
  "/assets/csr/photo_2026-08-23_23-01-26.jpg": csrPhoto4,
};

/** Resolve a DB image_url to a real browser-loadable src */
function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return communityImage;
  // Known local path → imported asset
  if (imageMap[url]) return imageMap[url];
  // Full URL (Supabase Storage or any CDN) → use directly
  if (url.startsWith("http")) return url;
  // Fallback
  return communityImage;
}

// -----------------------------------------------------------------------------
// ROUTE
// -----------------------------------------------------------------------------
export const Route = createFileRoute("/csr")({
  head: () => ({
    meta: [
      {
        title: "CSR & Community Initiatives — SLV Group",
      },
      {
        name: "description",
        content:
          "Discover SLV Group' community initiatives, charitable activities, donations and social-impact programs.",
      },
      {
        property: "og:title",
        content: "CSR & Community Initiatives — SLV Group",
      },
      {
        property: "og:description",
        content:
          "Building communities goes beyond construction. Explore SLV's social-impact initiatives.",
      },
      {
        property: "og:image",
        content: heroImage,
      },
    ],
  }),
  component: CSRPage,
});

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
// Keep this shape when moving the data to Supabase later.
// -----------------------------------------------------------------------------

type CSRCategory =
  "Community" | "Healthcare & Accessibility" | "Education" | "Environment" | "Food & Relief";

type CSRInitiative = {
  id: string;
  title: string;
  subtitle?: string;
  category: CSRCategory;
  year: number | null;
  date?: string;
  location?: string;
  shortDescription: string;
  description: string;
  detailParagraphs: string[];
  image: string;
  impact?: string;
  beneficiaries?: string;
  featured?: boolean;
};



// -----------------------------------------------------------------------------
// FILTERS
// -----------------------------------------------------------------------------

const filters: Array<"All" | CSRCategory> = [
  "All",
  "Education",
  "Community",
  "Healthcare & Accessibility",
  "Food & Relief",
  "Environment",
];

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function CategoryIcon({ category }: { category: CSRCategory }) {
  switch (category) {
    case "Education":
      return <GraduationCap className="h-5 w-5" />;

    case "Community":
      return <Users className="h-5 w-5" />;

    case "Healthcare & Accessibility":
      return <ShieldCheck className="h-5 w-5" />;

    case "Food & Relief":
      return <Utensils className="h-5 w-5" />;

    case "Environment":
      return <HeartHandshake className="h-5 w-5" />;

    default:
      return <HandHeart className="h-5 w-5" />;
  }
}

function CornerMarks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <span className="absolute left-3 top-3 h-5 w-5 border-l border-t border-gold/60" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r border-t border-gold/60" />
      <span className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-gold/60" />
      <span className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-gold/60" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// DETAIL MODAL
// -----------------------------------------------------------------------------

function InitiativeDetailModal({
  initiative,
  onClose,
}: {
  initiative: CSRInitiative | null;
  onClose: () => void;
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (initiative) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [initiative]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!initiative) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.25s ease-out" }}
      />

      {/* Modal */}
      <div
        className="relative z-10 mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_40px_120px_rgba(0,0,0,0.4)]"
        style={{ animation: "modalSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-gold/40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
          {/* Hero image */}
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <img
              src={initiative.image}
              alt={initiative.title}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent"
            />
            <CornerMarks />

            {/* Category badge */}
            <div className="absolute left-6 top-6 z-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <span className="text-gold">
                  <CategoryIcon category={initiative.category} />
                </span>
                {initiative.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-10 pt-2 sm:px-12 sm:pb-14">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gold" />
                {initiative.date || initiative.year}
              </span>
              {initiative.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  {initiative.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {initiative.title}
            </h2>

            {initiative.subtitle && (
              <p className="mt-3 text-lg italic text-gradient-gold font-display">
                {initiative.subtitle}
              </p>
            )}

            {/* Decorative divider */}
            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-16 bg-gradient-gold" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px flex-1 bg-gold/15" />
            </div>

            {/* Detail paragraphs */}
            <div className="mt-7 space-y-5">
              {initiative.detailParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-base leading-[1.85] text-muted-foreground sm:text-lg"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Impact cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/50 p-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Impact
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  {initiative.impact ?? "Community Support"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/50 p-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Beneficiaries
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  {initiative.beneficiaries ?? "Community"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/50 p-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Location
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  {initiative.location ?? "Andhra Pradesh"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.25);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212,175,55,0.45);
        }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// INITIATIVE CARD
// -----------------------------------------------------------------------------

function InitiativeCard({
  initiative,
  index,
  onLearnMore,
}: {
  initiative: CSRInitiative;
  index: number;
  onLearnMore: (initiative: CSRInitiative) => void;
}) {
  return (
    <Reveal delay={index * 70}>
      <article
        className="
          group relative flex h-full flex-col overflow-hidden
          rounded-[2rem]
          border border-border
          bg-card
          transition-all duration-500
          hover:-translate-y-1
          hover:border-gold/40
          hover:shadow-[0_25px_80px_rgba(0,0,0,0.12)]
          cursor-pointer
        "
        onClick={() => onLearnMore(initiative)}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <img
            src={initiative.image}
            alt={initiative.title}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="
              h-full w-full object-cover
              transition-transform duration-700
              group-hover:scale-105
            "
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
          />

          <CornerMarks />

          {/* Category */}
          <div className="absolute left-4 top-4 z-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <span className="text-gold">
                <CategoryIcon category={initiative.category} />
              </span>
              {initiative.category}
            </span>
          </div>

          {/* Year */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-gold">
                CSR Initiative
              </p>

              <p className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
                <CalendarDays className="h-3 w-3 text-gold" />
                {initiative.year}
              </p>
            </div>

            {initiative.location && (
              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-white/55">
                <MapPin className="h-3 w-3 text-gold" />
                {initiative.location}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-gold" />

            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Making an Impact
            </span>
          </div>

          <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {initiative.title}
          </h3>

          {initiative.subtitle && (
            <p className="mt-2 text-xs italic text-gold/80 font-medium">
              {initiative.subtitle}
            </p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {initiative.shortDescription}
          </p>

          {/* Impact metadata */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Impact
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {initiative.impact ?? "Community Support"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Beneficiaries
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {initiative.beneficiaries ?? "Community"}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-7">
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {initiative.location ?? "SLV Community"}
              </span>

              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gold transition-transform group-hover:translate-x-1">
                Learn More
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// -----------------------------------------------------------------------------
// PAGE
// -----------------------------------------------------------------------------

function CSRPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | CSRCategory>("All");
  const [selectedInitiative, setSelectedInitiative] = useState<CSRInitiative | null>(null);

  const { data: dbInitiatives, isLoading } = useQuery({
    queryKey: ["csr-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("csr_activities")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (error) {
        console.error("Error fetching CSR activities:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((item) => {
        const detailParagraphs = item.description
          ? item.description
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
          : [];

        return {
          id: item.id,
          title: item.title,
          category: item.category as CSRCategory,
          year: item.year,
          date: item.date || undefined,
          location: item.location || undefined,
          shortDescription: item.short_description,
          description: item.description,
          detailParagraphs: detailParagraphs.length > 0 ? detailParagraphs : [item.description],
          image: resolveImageUrl(item.image_url),
          impact: item.impact || undefined,
          beneficiaries: item.beneficiaries || undefined,
          featured: item.featured,
        };
      });
    },
  });

  const initiatives = dbInitiatives || [];

  const filteredInitiatives =
    activeFilter === "All"
      ? initiatives
      : initiatives.filter((item) => item.category === activeFilter);

  const featured = initiatives.find((item) => item.featured) ?? initiatives[0];

  return (
    <main className="overflow-hidden bg-background">
      {/* Detail Modal */}
      <InitiativeDetailModal
        initiative={selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
      />
      {/* =====================================================================
          HERO
      ====================================================================== */}

      <section className="relative isolate overflow-hidden">
        {/* Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-secondary/70 via-background to-background"
        />

        <div
          aria-hidden
          className="
            pointer-events-none absolute
            -right-48 top-0 -z-10
            h-[420px] w-[420px]
            rounded-full bg-gold/10 blur-[140px]
            sm:h-[620px] sm:w-[620px]
          "
        />

        <div
          aria-hidden
          className="
            pointer-events-none absolute
            -left-48 bottom-0 -z-10
            h-[320px] w-[320px]
            rounded-full bg-gold/5 blur-[120px]
            sm:h-[450px] sm:w-[450px]
          "
        />

        {/* Blueprint */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.45) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8 lg:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            {/* Copy */}
            <Reveal>
              <div className="mx-auto w-full max-w-2xl text-center sm:text-left">
                <div className="flex items-center justify-center gap-3 sm:justify-start">
                  <p className="section-label tracking-[0.28em] text-gold">
                    Corporate Social Responsibility
                  </p>

                  <span className="hidden h-px w-12 bg-gradient-gold sm:block" />
                </div>

                <h1 className="mt-7 font-display text-[clamp(2rem,4vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-foreground">
                  Building
                  <br />
                  <span className="italic font-normal text-gradient-gold">beyond buildings.</span>
                </h1>

                <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:mx-0 sm:text-lg lg:text-xl">
                  We believe meaningful growth is not only measured by what we build, but by the
                  difference we make in the communities around us.
                </p>

                <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 sm:mx-0">
                  <span className="h-px w-12 bg-gradient-gold sm:w-16" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  <span className="h-px flex-1 bg-gold/20" />
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <a
                    href="#initiatives"
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-gradient-gold
                      px-5 py-3
                      text-[10px] font-bold uppercase tracking-[0.18em]
                      text-gold-foreground shadow-xl
                      transition-all duration-300 hover:-translate-y-0.5
                    "
                  >
                    Explore Our Impact
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Hero image */}
            <Reveal delay={120}>
              <div className="relative mx-auto w-full max-w-2xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 border-r border-t border-gold/40 sm:-right-6 sm:-top-6 sm:h-36 sm:w-36"
                />

                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 border-b border-l border-gold/30 sm:-bottom-6 sm:-left-6 sm:h-32 sm:w-32"
                />

                <div className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-obsidian shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:rounded-[2.5rem]">
                  <img
                    src={heroImage}
                    alt="SLV community initiative"
                    className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/3]"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
                  />

                  <CornerMarks />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-gold">
                      Our responsibility
                    </p>

                    <p className="mt-2 max-w-lg font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      Stronger communities.
                      <br />A better tomorrow.
                    </p>
                  </div>
                </div>

                {/* Floating impact badge */}
                <div
                  className="
                    absolute -bottom-5 left-1/2 z-20
                    -translate-x-1/2
                    rounded-2xl
                    border border-white/10
                    bg-black/80
                    px-5 py-3
                    text-center
                    shadow-2xl
                    backdrop-blur-xl
                    sm:-bottom-6 sm:px-7
                  "
                >
                  <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-white/40">
                    SLV CSR
                  </p>

                  <p className="mt-1 font-display text-lg font-semibold text-gold sm:text-xl">
                    Giving with purpose
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          IMPACT NUMBERS
      ====================================================================== */}

      <section className="border-y border-border/70 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            {
              value: "20+",
              label: "Years of Community Commitment",
            },
            {
              value:
                initiatives.length > 0
                  ? initiatives.length < 10
                    ? `0${initiatives.length}`
                    : `${initiatives.length}`
                  : "00",
              label: "CSR Initiatives",
            },
            {
              value: "05",
              label: "Impact Areas",
            },
            {
              value: "01",
              label: "Shared Purpose",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "px-5 py-8 text-center sm:px-8 sm:py-10",
                index < 3 && "border-b border-border/70 md:border-b-0 md:border-r",
                index === 1 && "md:border-r",
              )}
            >
              <p className="font-display text-3xl font-bold text-gradient-gold sm:text-4xl">
                {item.value}
              </p>

              <p className="mx-auto mt-2 max-w-[180px] text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          FEATURED INITIATIVE
      ====================================================================== */}

      {featured && (
        <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[2.5rem]">
                {/* Image */}
                <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-[520px]">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:to-transparent"
                  />

                  <CornerMarks />

                  <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      Featured Initiative
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                      <HandHeart className="h-5 w-5" />
                    </span>

                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold">
                      {featured.category}
                    </p>
                  </div>

                  <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                    {featured.title}
                  </h2>

                  <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {featured.description}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Year
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-foreground">
                        {featured.year}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Reach
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-foreground">
                        {featured.beneficiaries}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* =====================================================================
          INITIATIVES
      ====================================================================== */}

      <section
        id="initiatives"
        className="relative overflow-hidden bg-secondary/40 py-24 sm:py-28 lg:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-160px] top-10 h-[420px] w-[420px] rounded-full bg-gold/5 blur-[130px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="section-label text-gold">Our Initiatives</p>

                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Giving back,
                  <br />
                  <span className="italic font-normal text-gradient-gold">making an impact.</span>
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  From education and community welfare to relief and environmental initiatives, our
                  CSR efforts are designed around meaningful impact.
                </p>
              </div>

              {/* Filters */}
              <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                      activeFilter === filter
                        ? "border-gold bg-gradient-gold text-gold-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-gold/40 hover:text-foreground",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 animate-pulse rounded-[2rem] border border-border bg-card/60"
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredInitiatives.map((initiative, index) => (
                <InitiativeCard
                  key={initiative.id}
                  initiative={initiative}
                  index={index}
                  onLearnMore={setSelectedInitiative}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredInitiatives.length === 0 && (
            <div className="mt-10 rounded-3xl border border-border bg-card px-6 py-16 text-center">
              <HeartHandshake className="mx-auto h-10 w-10 text-gold/70" />

              <p className="mt-5 font-display text-2xl font-semibold text-foreground">
                No initiatives found
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                New CSR initiatives will appear here as they are added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          OUR APPROACH
      ====================================================================== */}

      <section className="relative overflow-hidden bg-gradient-obsidian py-24 text-white sm:py-28 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-[-160px] h-[500px] w-[500px] rounded-full bg-gold/10 blur-[140px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-gold/5 blur-[130px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label text-gold">Our Approach</p>

              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
                Responsibility is
                <br />
                <span className="italic font-normal text-gold">part of who we are.</span>
              </h2>

              <p className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
                We believe that a strong business should contribute positively to the society that
                helps it grow.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: GraduationCap,
                title: "Education",
                description: "Creating opportunities for students and young learners.",
              },
              {
                icon: Users,
                title: "Community",
                description: "Supporting local communities and families.",
              },
              {
                icon: HandHeart,
                title: "Relief",
                description: "Responding to immediate needs through support and donations.",
              },
              {
                icon: Building2,
                title: "Sustainability",
                description: "Encouraging responsible and greener communities.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="group h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:bg-gold/[0.04]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <item.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-6 font-display text-xl font-semibold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/50">{item.description}</p>

                  <div className="mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
                    Explore impact
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          CLOSING
      ====================================================================== */}

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-gold/15 bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-[110px]"
            />

            <p className="section-label text-gold">Together, we can do more</p>

            <h2 className="relative mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Building communities.
              <br />
              <span className="italic font-normal text-gradient-gold">Creating change.</span>
            </h2>

            <p className="relative mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every contribution, initiative and act of kindness is a step toward a stronger
              community and a better future.
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
