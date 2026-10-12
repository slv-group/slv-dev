import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Heart,
  Scale,
  Download,
  Check,
  X,
  ChevronLeft,
  Maximize,
  Navigation,
  Building2,
  Ruler,
  Star,
  Home,
  Eye,
} from "lucide-react";
import { formatPrice, projects as staticProjects } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToProject } from "@/data/projects";
import { SiteVisitModal } from "@/components/SiteVisitModal";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    // First try Supabase
    const { data } = await supabase.from("projects").select("*").eq("slug", params.slug).single();

    let project;
    if (data) {
      project = mapSupabaseToProject(data);
    } else {
      // Fallback to static data
      project = staticProjects.find((p) => p.slug === params.slug);
    }

    if (!project) throw notFound();

    // Get related projects: try DB first, fallback to static
    const { data: moreData } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .neq("slug", params.slug)
      .limit(3);

    let moreProjects;
    if (moreData && moreData.length > 0) {
      moreProjects = moreData.map(mapSupabaseToProject);
    } else {
      // Fallback to static related projects
      moreProjects = staticProjects.filter((p) => p.slug !== params.slug).slice(0, 3);
    }

    return { project, moreProjects };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    return {
      meta: [
        { title: p ? `${p.name} — SLV Group` : "Project — SLV Group" },
        { name: "description", content: p?.tagline ?? "Luxury residence by SLV Group." },
        { property: "og:title", content: p?.name ?? "Project" },
        { property: "og:description", content: p?.tagline ?? "" },
        { property: "og:image", content: p?.image ?? "" },
        { name: "twitter:image", content: p?.image ?? "" },
      ],
    };
  },
  component: ProjectDetails,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-display text-3xl font-bold">Project not found</h1>
      <Link to="/projects" search={{ status: undefined }} className="text-gold underline">
        Back to projects
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Something went wrong loading this project.</p>
    </div>
  ),
});

const tabs = ["Overview", "Amenities & Specs", "Floor Plans"] as const;

function ProjectDetails() {
  const { project, moreProjects } = Route.useLoaderData();
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [plan, setPlan] = useState(0);
  const [showBrochure, setShowBrochure] = useState(false);

  const wished = isWishlisted(project.id);
  const comparing = isComparing(project.id);

  // Stat cards shown on the hero panel
  const statCards = [
    { Icon: Building2, val: project.status, sub: "Status" },
    { Icon: Ruler, val: `${project.sqftFrom.toLocaleString()}+`, sub: "Sqft" },
    { Icon: Home, val: project.bedrooms, sub: "Config" },
    { Icon: Star, val: project.category, sub: "Type" },
  ];

  return (
    <div className="pt-20 sm:pt-24">
      {/* ════════════════════════════════════════════════
          GALLERY — Cinematic Hero + Thumbnail Strip
      ════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/projects"
          search={{ status: undefined }}
          className="inline-flex items-center gap-1.5 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,2.5fr)_minmax(220px,1fr)]">
          {/* Main image */}
          <div
            className="group relative w-full cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl aspect-[4/5] min-[480px]:aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[480px] xl:h-[520px] 2xl:h-[560px]"
            onClick={() => setLightbox(project.gallery[activeImg])}
          >
            {project.gallery.map((g: string, i: number) => (
              <img
                key={i}
                src={g}
                alt={`${project.name} view ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover bg-black",
                  "transition-[opacity,transform] duration-700 ease-in-out",
                  activeImg === i ? "z-[1] scale-100 opacity-100" : "z-0 scale-105 opacity-0",
                )}
              />
            ))}

            {/* Gradients */}
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,18,0.96) 0%, rgba(10,10,18,0.45) 45%, transparent 75%)",
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 z-[2] hidden sm:block"
              style={{
                background: "linear-gradient(to right, rgba(10,10,18,0.55) 0%, transparent 60%)",
              }}
            />

            {/* Top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 sm:p-5">
              <div
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1.5 sm:gap-2 sm:px-4 sm:py-2"
                style={{
                  background: "rgba(8,8,14,0.6)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2"
                  style={{
                    background: "linear-gradient(135deg,oklch(0.84 0.1 90),oklch(0.7 0.14 78))",
                  }}
                />

                <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/90 sm:text-[11px] sm:tracking-[0.22em]">
                  SLV Premium
                </span>
              </div>

              <div
                className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold tabular-nums text-white/80 sm:px-3.5 sm:py-1.5 sm:text-xs"
                style={{
                  background: "rgba(8,8,14,0.6)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {String(activeImg + 1).padStart(2, "0")} /{" "}
                {String(project.gallery.length).padStart(2, "0")}
              </div>
            </div>

            {/* Desktop stat cards */}
            <div className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 opacity-0 translate-x-5 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 lg:flex">
              {statCards.map(({ Icon, val, sub }) => (
                <div
                  key={sub}
                  className="flex min-w-[76px] flex-col items-center rounded-xl border border-white/15 px-3 py-2 text-center"
                  style={{
                    background: "rgba(8,8,14,0.65)",
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <Icon className="mb-0.5 h-4 w-4" style={{ color: "oklch(0.78 0.11 85)" }} />

                  <span className="max-w-[90px] truncate text-[10px] font-bold text-white">
                    {val}
                  </span>

                  <span className="text-[8px] uppercase tracking-wider text-white/45">{sub}</span>
                </div>
              ))}
            </div>

            {/* Bottom content */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <div
                  className="h-px w-7 shrink-0 sm:w-12"
                  style={{
                    background:
                      "linear-gradient(to right, oklch(0.72 0.13 82), oklch(0.84 0.1 88))",
                  }}
                />

                <span
                  className="truncate text-[8px] font-bold uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.28em]"
                  style={{ color: "oklch(0.78 0.11 85 / 0.8)" }}
                >
                  {project.city}
                </span>
              </div>

              <h2
                className="mb-3 max-w-[90%] font-display text-xl font-bold leading-tight text-white sm:mb-4 sm:text-3xl lg:text-4xl"
                style={{
                  textShadow: "0 2px 20px rgba(0,0,0,0.7)",
                }}
              >
                {project.name}
              </h2>

              <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                <span
                  className="flex max-w-full items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/90 sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <MapPin className="h-3 w-3 shrink-0 text-gold" />

                  <span className="truncate">{project.location}</span>
                </span>

                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
                  style={{
                    background:
                      "linear-gradient(135deg,oklch(0.84 0.1 90),oklch(0.7 0.14 78),oklch(0.78 0.11 85))",
                    color: "oklch(0.13 0.005 265)",
                  }}
                >
                  <Eye className="h-3 w-3 shrink-0" />

                  <span className="hidden min-[400px]:inline">View Fullscreen</span>

                  <span className="min-[400px]:hidden">View</span>
                </span>

                <span
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/85 sm:px-3.5 sm:py-1.5 sm:text-xs"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {project.status}
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 z-[11] rounded-2xl ring-1 ring-inset ring-white/5 transition-all duration-500 sm:rounded-3xl" />
          </div>

          {/* Thumbnail gallery */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:block lg:h-[480px] lg:overflow-y-auto lg:pr-1 xl:h-[520px] 2xl:h-[560px]">
            {project.gallery.map((g: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "group relative min-w-0 overflow-hidden rounded-xl transition-all duration-300 aspect-[16/10] sm:rounded-2xl lg:mb-3 lg:block lg:h-[200px] lg:w-full lg:aspect-auto",
                  activeImg === i ? "ring-2 ring-gold" : "opacity-60 hover:opacity-100",
                )}
              >
                <img
                  src={g}
                  alt={`${project.name} ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {activeImg === i && (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(180,140,45,0.3), transparent 60%)",
                      }}
                    />

                    <div
                      className="absolute inset-x-0 bottom-0 h-[3px]"
                      style={{
                        background:
                          "linear-gradient(to right, oklch(0.72 0.13 82), oklch(0.84 0.1 88))",
                      }}
                    />
                  </>
                )}

                <div
                  className="absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:bottom-2 sm:right-2 sm:px-2 sm:text-[10px]"
                  style={{
                    background:
                      activeImg === i
                        ? "linear-gradient(135deg,oklch(0.84 0.1 90),oklch(0.7 0.14 78))"
                        : "rgba(0,0,0,0.6)",
                    color: activeImg === i ? "oklch(0.13 0.005 265)" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          HEADER — title, price, wishlist
      ═══════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-foreground">
                {project.status}
              </span>
              <span className="text-sm text-muted-foreground">{project.category}</span>
            </div>
            <h1 className="mt-3 wrap-break-word font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {project.name}
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground sm:items-center sm:text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold sm:mt-0" />
              <span>
                {project.location}, {project.city}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Starting from
              </p>
              <p className="font-display text-3xl font-bold text-foreground">
                {formatPrice(project.priceFrom)}
              </p>
            </div> */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(project.id)}
                aria-label="Wishlist"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl cursor-pointer",
                  wished ? "neu-pressed text-rose-500" : "neu-sm",
                )}
              >
                <Heart className={cn("h-5 w-5", wished && "fill-rose-500")} />
              </button>
              <button
                onClick={() => toggleCompare(project.id)}
                aria-label="Compare"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl cursor-pointer",
                  comparing ? "neu-pressed text-gold-foreground" : "neu-sm",
                )}
              >
                <Scale className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          {[
            ["Configurations", project.bedrooms],
            [
              "Saleable Area",
              `${project.sqftFrom.toLocaleString()} - ${project.sqftTo.toLocaleString()} sqft`,
            ],
            ["Launch", project.launchDate],
            ["Category", project.category],
          ].map(([l, v]) => (
            <div key={l} className="min-w-0 rounded-2xl bg-card p-4 neu-sm sm:p-5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                {l}
              </p>

              <p className="mt-1 break-words font-display text-base font-semibold text-foreground sm:text-lg">
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ Tabs ═══════ */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex min-w-max gap-1.5 rounded-2xl bg-background p-2 neu-pressed sm:gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer sm:px-5 sm:text-sm",
                  tab === t ? "neu text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 min-h-[300px]">
          {/* Overview */}
          {tab === "Overview" && (
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Project Vision
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{project.description}</p>
                <div className="mt-8 rounded-3xl bg-card p-6 neu">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <Navigation className="h-5 w-5 text-gold" /> Geo-Spatial Insights
                  </h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {project.proximity.map((pr: { label: string; distance: string }) => (
                      <div
                        key={pr.label}
                        className="flex items-center justify-between rounded-xl bg-background px-4 py-3 neu-sm"
                      >
                        <span className="text-sm text-muted-foreground">{pr.label}</span>
                        <span className="font-display text-base font-semibold text-gold-foreground">
                          {pr.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <aside className="h-fit rounded-3xl bg-gradient-obsidian p-7 text-background">
                <h3 className="font-display text-xl font-semibold">Request Details</h3>
                <p className="mt-2 text-sm text-background/65">
                  Get the brochure, floor plans, and pricing.
                </p>
                {project.brochureUrl && (
                  <button
                    type="button"
                    onClick={() => setShowBrochure(true)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-gold-foreground cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download Brochure
                  </button>
                )}
                <Link
                  to="/contact"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-semibold text-background hover:bg-white/10 cursor-pointer"
                >
                  Enquire Now
                </Link>

                <SiteVisitModal
                  projectId={project.id}
                  projectName={project.name}
                  trigger={
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-background/10 py-3.5 text-sm font-bold text-gold hover:bg-background/20 transition-all border border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer">
                      <MapPin className="h-4 w-4" /> Book Site Visit
                    </button>
                  }
                />
              </aside>
            </div>
          )}

          {/* Amenities & Specs */}
          {tab === "Amenities & Specs" && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Amenities</h2>
                <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                  {project.amenities.map((a: string) => (
                    <div key={a} className="flex items-center gap-2 rounded-2xl glass p-4 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground flex-shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Specifications
                </h2>
                <div className="mt-5 space-y-3">
                  {project.specifications.map((s: { label: string; value: string }) => (
                    <div key={s.label} className="rounded-2xl bg-card p-5 neu-sm">
                      <p className="text-xs uppercase tracking-wider text-gold-foreground">
                        {s.label}
                      </p>
                      <p className="mt-1 text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Floor Plans */}
          {tab === "Floor Plans" && (
            <div>
              <div className="max-w-full overflow-x-auto pb-2">
                <div className="inline-flex min-w-max gap-2 rounded-2xl bg-background p-2 neu-pressed">
                  {project.floorPlans.map(
                    (fp: { type: string; sqft: number; image: string }, i: number) => (
                      <button
                        key={fp.type}
                        onClick={() => setPlan(i)}
                        className={cn(
                          "whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition-all cursor-pointer sm:px-5 sm:text-sm",
                          plan === i ? "neu text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {fp.type}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
                <button
                  onClick={() => setLightbox(project.floorPlans[plan].image)}
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-card neu sm:aspect-[16/10] sm:rounded-3xl"
                >
                  <img
                    src={project.floorPlans[plan].image}
                    alt={`${project.floorPlans[plan].type} floor plan`}
                    className="h-full w-full object-cover opacity-90 p-2 sm:p-4"
                  />
                  <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
                    <Maximize className="h-3.5 w-3.5" /> Zoom Plan
                  </span>
                </button>
                <div className="rounded-3xl bg-card p-7 neu">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Configuration
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {project.floorPlans[plan].type}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                    Saleable Area
                  </p>
                  <p className="font-display text-2xl font-semibold text-gold-foreground">
                    {project.floorPlans[plan].sqft.toLocaleString()} sqft
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Related ═══════ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">More Residences</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {moreProjects.map((p) => (
            <Link
              key={p.id}
              to="/projects/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-2xl bg-card neu-sm"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-display text-lg font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ Lightbox ═══════ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-obsidian/90 p-3 sm:p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md sm:right-6 sm:top-6"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-7 sm:w-7" />
          </button>
          <img
            src={lightbox}
            alt="Fullscreen"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-xl object-contain sm:max-h-[90vh] sm:rounded-2xl"
          />
        </div>
      )}

      {/* ═══════ Brochure viewer ═══════ */}
      {showBrochure && project.brochureUrl && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-obsidian">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-6 sm:py-4">
            <p className="min-w-0 truncate font-display text-sm font-semibold text-background sm:text-lg">
              {project.name} — Brochure
            </p>

            <button
              onClick={() => setShowBrochure(false)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-background hover:bg-white/20 sm:gap-2 sm:px-4 sm:text-sm"
              aria-label="Close brochure"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden min-[380px]:inline">Close</span>
            </button>
          </div>
          <iframe
            src={project.brochureUrl.replace("/view", "/preview")}
            title={`${project.name} Brochure`}
            className="h-full w-full flex-1 border-0"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
    </div>
  );
}
