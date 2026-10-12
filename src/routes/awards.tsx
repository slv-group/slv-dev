import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  Crown,
  ExternalLink,
  Landmark,
  Medal,
  Trophy,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// TEMPORARY / DUMMY IMAGES
// Replace these later with images uploaded from your Admin Panel / Supabase.
// -----------------------------------------------------------------------------
import heroAwardImage from "@/assets/heroawardsection.png";
import leadershipImage from "@/assets/penmetsa_srinivasa_raju.png";

// -----------------------------------------------------------------------------
// ROUTE
// -----------------------------------------------------------------------------
export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      {
        title: "Awards & Recognition — SLV Group",
      },
      {
        name: "description",
        content: "Explore the awards and recognition earned by  & Developers and its leadership.",
      },
      {
        property: "og:title",
        content: "Awards & Recognition — SLV Group",
      },
      {
        property: "og:description",
        content: "Recognition earned by SLV Group and its leadership.",
      },
      {
        property: "og:image",
        content: heroAwardImage,
      },
    ],
  }),
  component: AwardsPage,
});

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
// This structure is intentionally admin-panel friendly.
// Later replace this local array with Supabase data without changing the UI.
// -----------------------------------------------------------------------------

type Award = Tables<"awards">;
type AwardCategory = "Leadership" | "Developer" | "Project" | "Lifetime Achievement";

// -----------------------------------------------------------------------------
// FILTERS
// -----------------------------------------------------------------------------
const filters: Array<"All" | AwardCategory> = [
  "All",
  "Leadership",
  "Developer",
  "Project",
  "Lifetime Achievement",
];

// -----------------------------------------------------------------------------
// SMALL COMPONENTS
// -----------------------------------------------------------------------------
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

function CategoryIcon({ category }: { category: AwardCategory }) {
  if (category === "Leadership") {
    return <Crown className="h-5 w-5" />;
  }

  if (category === "Developer") {
    return <Trophy className="h-5 w-5" />;
  }

  if (category === "Project") {
    return <Building2 className="h-5 w-5" />;
  }

  return <Medal className="h-5 w-5" />;
}

function AwardCard({ award, index }: { award: Award; index: number }) {
  const category = award.category as AwardCategory;
  return (
    <Reveal delay={index * 20}>
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
        "
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <img
            src={award.image_url}
            alt={`${award.title} — ${award.recipient}`}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="
              h-full w-full object-cover
              transition-transform duration-700
              group-hover:scale-105
            "
          />

          {/* Image overlays */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t
              from-black/75 via-black/10 to-transparent
            "
          />

          <CornerMarks />

          {/* Year */}
          <div className="absolute left-4 top-4 z-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <CalendarDays className="h-3 w-3 text-gold" />
              {award.year ?? "Recognition"}
            </span>
          </div>

          {/* Category */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-gold">
                {category}
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                {award.issuer}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold backdrop-blur-md">
              <CategoryIcon category={category} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-gold" />
            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Recognition
            </span>
          </div>

          <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {award.title}
          </h3>

          {award.subtitle && (
            <p className="mt-1 font-display text-lg italic text-gradient-gold sm:text-xl">
              {award.subtitle}
            </p>
          )}

          <div className="mt-5 h-px w-14 bg-gradient-gold" />

          <p className="mt-5 font-display text-lg font-semibold text-foreground">
            {award.recipient}
          </p>

          {award.organization && (
            <p className="mt-1 text-sm text-muted-foreground">{award.organization}</p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{award.description}</p>

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              {award.location ? (
                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {award.location}
                </span>
              ) : (
                <span />
              )}

              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gold transition-transform group-hover:translate-x-1">
                View Recognition
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
function AwardsPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | AwardCategory>("All");

  const {
    data: awards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-awards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("awards")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).filter((award): award is Award & { category: AwardCategory } =>
        ["Leadership", "Developer", "Project", "Lifetime Achievement"].includes(award.category),
      );
    },
  });

  const filteredAwards = useMemo(() => {
    if (activeFilter === "All") {
      return awards;
    }

    return awards.filter((award) => award.category === activeFilter);
  }, [awards, activeFilter]);

  return (
    <main className="overflow-hidden bg-background">
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
            -right-48 top-10 -z-10
            h-[420px] w-[420px]
            rounded-full
            bg-gold/10
            blur-[140px]
            sm:h-[620px] sm:w-[620px]
          "
        />

        <div
          aria-hidden
          className="
            pointer-events-none absolute
            -left-48 bottom-0 -z-10
            h-[320px] w-[320px]
            rounded-full
            bg-gold/5
            blur-[120px]
            sm:h-[450px] sm:w-[450px]
          "
        />

        {/* Blueprint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.45) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8 lg:pb-40">
          <div className="grid items-center gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-8 xl:grid-cols-[0.58fr_1.42fr] xl:gap-10">
            {/* Hero copy */}
            <Reveal>
              <div className="max-w-xl xl:max-w-lg">
                <div className="flex items-center gap-3">
                  <p className="section-label tracking-[0.28em] text-gold">Awards & Recognition</p>
                  <span className="h-px w-10 bg-gradient-gold sm:w-16" />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                  <span>Times Business Awards</span>
                  <span className="text-gold/40">•</span>
                  <span>Andhra Pradesh</span>
                  <span className="text-gold/40">•</span>
                  <span>2025</span>
                </div>

                <h1 className="mt-7 font-display text-[clamp(2rem,4vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-foreground">
                  Recognition
                  <br />
                  <span className="italic font-normal text-gradient-gold">worth remembering.</span>
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                  Celebrating the people, projects and leadership that have shaped the SLV legacy
                  over the years.
                </p>

                <div className="mt-8 flex max-w-xl items-center gap-3">
                  <span className="h-px w-12 bg-gradient-gold sm:w-16" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  <span className="h-px flex-1 bg-gold/20" />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#awards"
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-gradient-gold
                      px-5 py-3
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-gold-foreground
                      shadow-xl
                      transition-all duration-300
                      hover:-translate-y-0.5
                    "
                  >
                    Explore Awards
                    <ArrowDown className="h-3.5 w-3.5" />
                  </a>

                  <a
                    href="#story"
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      border border-border
                      bg-card/60
                      px-5 py-3
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-foreground
                      backdrop-blur-sm
                      transition-all duration-300
                      hover:border-gold/50
                      hover:bg-gold/5
                    "
                  >
                    The Story
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Hero visual */}
            <Reveal delay={120}>
              <div className="relative w-full lg:-mr-8 xl:-mr-12">
                {/* Architectural frame */}
                <div
                  aria-hidden
                  className="
        pointer-events-none absolute
        -right-4 -top-4
        h-24 w-24
        border-r border-t border-gold/40
        sm:-right-5 sm:-top-5
        sm:h-32 sm:w-32
        lg:-right-7 lg:-top-7
        lg:h-40 lg:w-40
      "
                />

                <div
                  aria-hidden
                  className="
        pointer-events-none absolute
        -bottom-4 -left-4
        h-24 w-24
        border-b border-l border-gold/30
        sm:-bottom-5 sm:-left-5
        sm:h-32 sm:w-32
        lg:-bottom-7 lg:-left-7
        lg:h-36 lg:w-36
      "
                />

                {/* Main image */}
                <div
                  className="
    group relative overflow-hidden
    rounded-[1.5rem]
    border border-gold/15
    bg-black
    shadow-[0_35px_110px_rgba(0,0,0,0.28)]
    sm:rounded-[2rem]
    lg:rounded-[2.5rem]
  "
                >
                  <img
                    src={heroAwardImage}
                    alt="SLV Developers entrance"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="
      block
      w-full
      h-auto
      min-h-[260px]
      object-cover
      transition-transform
      duration-700
      group-hover:scale-[1.015]
      sm:min-h-[340px]
      md:min-h-[400px]
      lg:min-h-[500px]
      xl:min-h-[560px]
    "
                  />

                  <div
                    aria-hidden
                    className="
      pointer-events-none
      absolute inset-0
      bg-gradient-to-t
      from-black/75
      via-black/10
      to-transparent
    "
                  />

                  <CornerMarks />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
                    <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-gold sm:text-[9px] lg:text-[10px]">
                      SLV Group
                    </p>

                    <p className="mt-2 max-w-md font-display text-sm font-semibold leading-tight text-white sm:text-xl lg:text-2xl">
                      A legacy built
                      <br />
                      on trust.
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <div
                  className="
        absolute
        -bottom-5
        right-4
        z-20
        whitespace-nowrap
        rounded-2xl
        border border-white/10
        bg-black/85
        px-5 py-2.5
        text-center
        shadow-2xl
        backdrop-blur-xl
        sm:-bottom-6
        sm:px-7 sm:py-3
      "
                >
                  <p className="text-[6px] font-bold uppercase tracking-[0.24em] text-white/40">
                    Recognition
                  </p>

                  <p className="mt-0.5 font-display text-sm font-semibold text-gold sm:text-lg">
                    Andhra Pradesh
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          QUICK RECOGNITION STRIP
      ====================================================================== */}
      <section className="border-y border-border/70 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/70 md:grid-cols-4">
          <div className="px-5 py-7 text-center sm:px-8">
            <p className="font-display text-3xl font-bold text-gradient-gold">
              {awards.filter((award) => award.year === 2025).length}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              2025 Recognitions
            </p>
          </div>

          <div className="border-b border-border/70 px-5 py-7 text-center sm:px-8 md:border-b-0">
            <p className="font-display text-3xl font-bold text-gradient-gold">{awards.length}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Recognition Records
            </p>
          </div>

          <div className="border-t border-border/70 px-5 py-7 text-center sm:px-8 md:border-t-0 md:border-l-0">
            <p className="font-display text-3xl font-bold text-gradient-gold">2007</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              SLV Founded
            </p>
          </div>

          <div className="border-t border-border/70 px-5 py-7 text-center sm:px-8 md:border-t-0">
            <p className="font-display text-3xl font-bold text-gradient-gold">01</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Leadership Story
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FEATURED AWARDS
      ====================================================================== */}
      <section id="awards" className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-gold/5 blur-[130px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="section-label text-gold">Recognition Portfolio</p>

                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Awards that
                  <br />
                  <span className="italic font-normal text-gradient-gold">mark the journey.</span>
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  A collection of recognitions documented in the supplied publication and leadership
                  feature.
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
                      "rounded-full border px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] transition-all duration-300",
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

          {/* Award cards */}
          {isLoading ? (
            <main className="bg-background">
              <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-[2rem] border border-border bg-card"
                    >
                      <div className="aspect-[4/3] animate-pulse bg-muted" />
                      <div className="space-y-3 p-6">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAwards.map((award, index) => (
                <AwardCard key={award.id} award={award} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          LEADERSHIP STORY
      ====================================================================== */}
      <section
        id="story"
        className="relative overflow-hidden bg-gradient-obsidian py-24 text-white sm:py-28 lg:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-[-120px] h-[500px] w-[500px] rounded-full bg-gold/10 blur-[140px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-gold/5 blur-[130px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <div className="relative mx-auto w-full max-w-md">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
                  <img
                    src="/assets/csr/awardsrinivasaraju3.png"
                    alt="Penmetsa Srinivasa Raju"
                    className="aspect-[4/5] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"
                  />

                  <CornerMarks />

                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                      Leadership
                    </p>

                    <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                      Penmetsa Srinivasa Raju
                    </h3>

                    <p className="mt-1 text-xs text-white/50">SLV Group</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="max-w-3xl">
                <p className="section-label text-gold">A Leadership Legacy</p>

                <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  From humble beginnings
                  <br />
                  <span className="italic font-normal text-gold">to building legacies.</span>
                </h2>

                <p className="mt-6 text-base leading-relaxed text-white/65 sm:text-lg">
                  The provided feature describes a journey that began in a modest farming household,
                  progressed through dairy entrepreneurship, and eventually led to entering real
                  estate in 2007.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <UserRound className="h-5 w-5 text-gold" />
                    <p className="mt-4 font-display text-2xl font-semibold">2007</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/35">
                      Real Estate Journey
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <Landmark className="h-5 w-5 text-gold" />
                    <p className="mt-4 font-display text-2xl font-semibold">20</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/35">
                      Residential Projects
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <Award className="h-5 w-5 text-gold" />
                    <p className="mt-4 font-display text-2xl font-semibold">01</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/35">
                      Leadership Recognition
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-4 rounded-2xl border border-gold/15 bg-gold/5 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                    <Medal className="h-5 w-5" />
                  </div>

                  <p className="text-sm leading-relaxed text-white/60">
                    The publication also mentions a Times of India Lifetime Achievement Award
                    recognising the enduring business legacy of Penmetsa Srinivasa Raju.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PUBLICATION NOTE
      ====================================================================== */}
      <section className="px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-gold/15 bg-card px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-[110px]"
            />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="section-label text-gold">Source Publication</p>

                <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  Applauding the Business Icons
                  <br />
                  <span className="italic font-normal text-gradient-gold">of Andhra Pradesh</span>
                </h2>

                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  The supplied publication identifies the material as an Optimal Media Solutions
                  initiative circulated with The Times of India, Vijayawada and Vizag, on Saturday,
                  27 September 2025.
                </p>
              </div>

              <a
                href="#awards"
                className="
                  group inline-flex items-center justify-center gap-3
                  rounded-2xl
                  bg-gradient-gold
                  px-7 py-4
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-gold-foreground
                  shadow-xl
                  transition-all duration-300
                  hover:-translate-y-0.5
                "
              >
                Explore Awards
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================================
          CLOSING
      ====================================================================== */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-obsidian px-6 py-14 text-center text-white sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-[110px]"
            />

            <p className="section-label text-gold">Recognition continues</p>

            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Built with purpose.
              <br />
              <span className="italic font-normal text-gold">Recognised with pride.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              Every recognition is a reminder of the responsibility behind the SLV name — to keep
              building with quality, integrity and trust.
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
