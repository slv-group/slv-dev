import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Quote,
  Crown,
  Award,
  Shield,
  TrendingUp,
  Star,
  MapPin,
  ShieldCheck,
  Building2,
  Leaf,
  Landmark,
  Maximize2,
  X,
} from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { testimonials, mapSupabaseToProject } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { SOCIAL_LINKS } from "@/lib/social";
import aboutImage from "@/assets/projects/slv-anjani-heights/anjani-elevation-1.jpg";
import aboutImage2 from "@/assets/projects/slv-amaravati-pride/pride-elevation-1.jpg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SLV Group — Premium Homes & Plotted Layouts in Vijayawada & Amaravati" },
      {
        name: "description",
        content:
          "Discover premier residential gated communities, open plots, and luxury developments across Vijayawada, Guntur, and the Amaravati capital region by SLV Group.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "SLV Group — Leading Real Estate Developers" },
      {
        property: "og:description",
        content:
          "Premier plotted layouts, luxury villas, and residential developments across the Vijayawada and Amaravati capital region.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SLV Group — Leading Real Estate Developers" },
      {
        name: "twitter:description",
        content:
          "Premier plotted layouts, luxury villas, and residential developments across the Vijayawada and Amaravati capital region.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in",
      },
    ],
  }),
  loader: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("status", "Ongoing")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[HomeLoader] Failed to fetch ongoing projects:", error);

      return {
        ongoingProjects: [],
        featuredPhotos: [],
      };
    }

    const ongoingProjects = (data ?? []).map(mapSupabaseToProject);

    // Hoist SLV Green Grandeur to the beginning
    ongoingProjects.sort((a, b) => {
      if (a.name === "SLV Green Grandeur") return -1;
      if (b.name === "SLV Green Grandeur") return 1;
      return 0;
    });

    // Query genuine project photographs from published projects
    const { data: allProjectsData } = await supabase
      .from("projects")
      .select("id, name, slug, category, location, city, cover_image, gallery")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    const featuredPhotos: {
      id: string;
      url: string;
      title: string;
      projectName: string;
      projectSlug: string;
      category: string;
      location: string;
    }[] = [];

    if (allProjectsData) {
      for (const p of allProjectsData) {
        if (Array.isArray(p.gallery) && p.gallery.length > 0) {
          (p.gallery as unknown as string[]).slice(0, 2).forEach((imgUrl, idx) => {
            if (typeof imgUrl === "string" && imgUrl.startsWith("http")) {
              featuredPhotos.push({
                id: `${p.id}-gal-${idx}`,
                url: imgUrl,
                title: `${p.name} View ${idx + 1}`,
                projectName: p.name,
                projectSlug: p.slug,
                category: p.category || "Residential",
                location: p.location || p.city || "Vijayawada",
              });
            }
          });
        } else if (
          p.cover_image &&
          typeof p.cover_image === "string" &&
          p.cover_image.startsWith("http")
        ) {
          featuredPhotos.push({
            id: `${p.id}-cover`,
            url: p.cover_image,
            title: `${p.name} Elevation`,
            projectName: p.name,
            projectSlug: p.slug,
            category: p.category || "Residential",
            location: p.location || p.city || "Vijayawada",
          });
        }
      }
    }

    return {
      ongoingProjects,
      featuredPhotos,
    };
  },

  component: Index,
});

const philosophy = [
  {
    no: "01",
    icon: Award,
    title: "Unrivaled Quality",
    desc: "Premium-grade materials and industry-leading techniques ensure durability that spans generations.",
  },
  {
    no: "02",
    icon: TrendingUp,
    title: "Strategic Locations",
    desc: "Projects sit on the fastest-growing corridors of Vijayawada and Amaravati for maximum value appreciation.",
  },
  {
    no: "03",
    icon: Shield,
    title: "Absolute Transparency",
    desc: "RERA-approved projects, clear titles, and honest pricing have been our hallmark since 2007.",
  },
  {
    no: "04",
    icon: Crown,
    title: "20 Years of Trusted Legacy",
    desc: "For over two decades, SLV Group has delivered premium communities built on trust, quality, and customer satisfaction.",
  },
];

const accolades = [
  { text: "20+ Years of Trust", icon: Crown },
  { text: "ISO 9001:2015 Certified", icon: Award },
  { text: "5000+ Happy Families", icon: Shield },
  { text: "CREDAI Member", icon: TrendingUp },
  { text: "RERA", icon: ShieldCheck },
  { text: "CREDAI", icon: Building2 },
  { text: "IGBC", icon: Leaf },
  { text: "AP CHAMBERS", icon: Building2 },
  { text: "BAI", icon: Landmark },
];

function Index() {
  const featured = testimonials[0];
  const { ongoingProjects, featuredPhotos = [] } = Route.useLoaderData();
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setItemsPerPage(1);
      } else if (width < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  // Reset page whenever the number of visible cards changes
  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage]);

  const totalPages = Math.ceil(ongoingProjects.length / itemsPerPage);

  const visibleProjects = ongoingProjects.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  );

  const nextPage = () => {
    setCurrentPage((page) => (page < totalPages - 1 ? page + 1 : 0));
  };

  const previousPage = () => {
    setCurrentPage((page) => (page > 0 ? page - 1 : totalPages - 1));
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: "SLV Group",
            url: "https://www.slvgroup.co.in",
            logo: "https://www.slvgroup.co.in/slv-logo.png",
            description:
              "Premier real estate developer in Andhra Pradesh, delivering residential gated communities, open plots, and commercial landmarks across Vijayawada, Guntur, and Amaravati.",
            telephone: "+91-98595-95939",
            email: "info@slvgroup.co.in",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Ground Floor, SLV Tummala Complex, Opp. SLV PNB Commercial, Gunadala, Inner Ring Road",
              addressLocality: "Vijayawada",
              addressRegion: "Andhra Pradesh",
              postalCode: "520004",
              addressCountry: "IN",
            },
          }),
        }}
      />
      <HeroSection />

      {/* ── Accolades marquee strip ── */}
      <section
        aria-label="Accreditations and certifications"
        className="relative overflow-hidden border-b border-border/60 bg-card py-0"
      >
        {/* Gold accent lines */}
        <div className="absolute inset-x-0 top-0 h-px hairline-gold opacity-70" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold opacity-70" aria-hidden />

        <div className="flex overflow-hidden py-4">
          <div className="animate-marquee motion-reduce:animate-none flex shrink-0 items-center gap-0 whitespace-nowrap">
            {/* Primary set announced to assistive technologies */}
            <div className="flex items-center gap-0 shrink-0">
              {accolades.map((a, i) => (
                <span
                  key={`primary-${i}`}
                  className="flex items-center gap-3 px-8 text-[0.72rem] font-bold uppercase tracking-[0.3em] text-muted-foreground"
                >
                  <a.icon className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden />
                  {a.text}
                  <span
                    aria-hidden
                    className="ml-4 h-px w-8 opacity-30"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                </span>
              ))}
            </div>

            {/* Decorative duplicate loops hidden from screen readers to prevent repetition */}
            <div aria-hidden="true" className="flex items-center gap-0 shrink-0 select-none">
              {[...accolades, ...accolades, ...accolades].map((a, i) => (
                <span
                  key={`deco-${i}`}
                  className="flex items-center gap-3 px-8 text-[0.72rem] font-bold uppercase tracking-[0.3em] text-muted-foreground"
                >
                  <a.icon className="h-3.5 w-3.5 text-gold shrink-0" />
                  {a.text}
                  <span
                    className="ml-4 h-px w-8 opacity-30"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Locations strip ── */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 py-5 sm:flex-row sm:gap-6">
          {/* Label */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold/5">
              <MapPin className="h-4 w-4 text-gold" />
            </span>

            <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Our Locations
            </span>
          </div>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Locations */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {["Vijayawada", "Gannavaram", "Guntupalli", "Amaravathi", "Bhimavaram"].map(
              (location) => (
                <Link
                  key={location}
                  to="/projects"
                  search={{ location: location.toLowerCase() }}
                  className="group flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-gold/60 hover:bg-gold/10 hover:text-foreground hover:shadow-sm"
                >
                  <MapPin className="h-3 w-3 text-gold/60 transition-transform duration-300 group-hover:scale-110 group-hover:text-gold" />
                  <span>{location}</span>
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Gold accent */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px opacity-50"
          style={{ background: "var(--gradient-gold)" }}
        />
      </section>

      {/* ── About SLV — staggered images ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-10 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <div className="relative flex gap-5">
            {/* Ornamental frame lines */}
            <div
              className="absolute -left-6 -top-6 -z-10 h-36 w-36 border-l border-t opacity-40"
              style={{ borderColor: "var(--color-gold)" }}
            />
            <div
              className="absolute -bottom-6 -right-6 -z-10 h-24 w-24 border-r border-b opacity-30"
              style={{ borderColor: "var(--color-gold)" }}
            />

            <div className="flex gap-5 items-end">
              <div className="w-2/3 overflow-hidden rounded-md md:rounded-2xl shadow-2xl">
                <img
                  src={aboutImage}
                  alt="SLV Anjani Heights — Landmark residential project in Vijayawada"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="mt-20 w-1/3 overflow-hidden rounded-md md:rounded-2xl shadow-xl">
                <img
                  src={aboutImage2}
                  alt="SLV Amaravati Pride — Premium residential community"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="aspect-[3/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-6 left-8 z-10 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-xl"
              style={{
                background: "var(--gradient-royal)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="font-display text-2xl font-bold text-white">20+</p>
              <p className="text-[0.65rem] uppercase tracking-widest text-white/60">
                Years of Trust
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:pl-6">
          <p className="section-label text-gold">Our Heritage</p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Building Legacies{" "}
            <span className="inline-block whitespace-nowrap italic font-normal text-gradient-gold pr-3">
              Since 2007
            </span>
          </h2>

          {/* Hairline ornament */}
          <div className="mt-8 flex items-center gap-3">
            <div
              className="h-px flex-1 max-w-[60px]"
              style={{ background: "var(--gradient-gold)" }}
            />
            <div className="h-1 w-1 rotate-45 bg-gold" />
          </div>

          <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
            At SLV Group, we don't just build structures — we curate lifestyles. Beginning in
            Bhimavaram in 2007 and entering Vijayawada in 2015 with SLV Anjani Heights, we have
            redefined the skyline of the Amaravati capital region with architectural brilliance and
            structural integrity.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Guided by founder Sri Penmetsa Srinivasa Raju, SLV has delivered 30+ residential
            projects, 4+ commercial projects, and an educational institute — all built on trust.
          </p>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["20+", "Years"],
              ["5000+", "Families"],
              ["35+", "Projects"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-secondary/60 p-4 text-center">
                <p className="font-display text-2xl font-bold text-gradient-gold">{n}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {l}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="group mt-10 inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground hover-gold-line"
          >
            <span>Discover Our Story</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-300 group-hover:bg-gradient-gold group-hover:text-gold-foreground group-hover:border-transparent">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* ── Featured projects ── */}
      <section
        className="relative overflow-hidden py-24 sm:py-28 lg:py-32"
        style={{
          background:
            "linear-gradient(180deg, var(--color-secondary) 0%, var(--color-background) 100%)",
        }}
      >
        {/* Decorative background pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-gold) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label text-gold">Portfolio</p>

                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Ongoing Projects
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Explore our current developments across Vijayawada and the Amaravati region.
                </p>
              </div>

              <Link
                to="/projects"
                search={{ status: undefined }}
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-sm font-bold text-foreground transition-all duration-300 hover:border-gold hover:bg-gradient-gold hover:text-gold-foreground"
              >
                View All Projects
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          {/* Carousel */}
          <Reveal delay={100}>
            <div className="relative mt-10 sm:mt-14">
              {/* Projects */}
              <div className="mx-auto w-full">
                {/* Search Engine & Accessibility HTML Index for Crawlers */}
                <div className="sr-only">
                  <h3>All Ongoing Real Estate Projects by SLV Group</h3>
                  <ul>
                    {ongoingProjects.map((p) => (
                      <li key={`crawler-${p.id}`}>
                        <Link to="/projects/$slug" params={{ slug: p.slug }}>
                          {p.name} - {p.category} in {p.location || p.city} ({p.tagline})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {ongoingProjects.length > 0 ? (
                  <div
                    key={`${currentPage}-${itemsPerPage}`}
                    className={cn(
                      "grid gap-5 sm:gap-6",
                      itemsPerPage === 1 && "grid-cols-1",
                      itemsPerPage === 2 && "grid-cols-1 sm:grid-cols-2",
                      itemsPerPage === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                    )}
                  >
                    {visibleProjects.map((project, index) => (
                      <Reveal key={project.id} delay={index * 80} className="h-full">
                        <PropertyCard project={project} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
                    <p className="font-display text-2xl font-semibold text-foreground">
                      No ongoing projects at the moment.
                    </p>

                    <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                      Please check back soon for our latest developments.
                    </p>

                    <Link
                      to="/projects"
                      search={{ status: undefined }}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-3 text-sm font-semibold text-gold-foreground"
                    >
                      Explore All Projects
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation */}
              {ongoingProjects.length > itemsPerPage && (
                <div className="mt-8 flex items-center justify-between gap-4">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={previousPage}
                    aria-label="Previous projects"
                    className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full border border-border bg-card
            text-foreground shadow-sm
            transition-all duration-300
            hover:border-gold hover:bg-gold hover:text-gold-foreground
            sm:h-11 sm:w-11
          "
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Counter */}
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
                    <div className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground sm:text-xs">
                      <span className="text-gold">{String(currentPage + 1).padStart(2, "0")}</span>
                      <span className="mx-1.5">/</span>
                      <span>{String(totalPages).padStart(2, "0")}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentPage(index)}
                          aria-label={`Go to project page ${index + 1}`}
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: index === currentPage ? "28px" : "8px",
                            background:
                              index === currentPage ? "var(--color-gold)" : "rgba(127,127,127,0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={nextPage}
                    aria-label="Next projects"
                    className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full border border-border bg-card
            text-foreground shadow-sm
            transition-all duration-300
            hover:border-gold hover:bg-gold hover:text-gold-foreground
            sm:h-11 sm:w-11
          "
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Genuine SLV Project Photographs Showcase ── */}
      {featuredPhotos.length > 0 && (
        <section className="relative overflow-hidden py-24 sm:py-28 bg-card/30 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-label text-gold tracking-[0.28em]">Visual Showcase</p>
                  <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">
                    Project Gallery
                  </h2>
                  <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
                    Authentic site captures, elevations, and completed architectures
                    from our developments across Andhra Pradesh.
                  </p>
                </div>

                <Link
                  to="/gallery"
                  className="group inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-sm font-bold text-foreground transition-all duration-300 hover:border-gold hover:bg-gradient-gold hover:text-gold-foreground cursor-pointer"
                >
                  <span>View Full Gallery</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            {/* Photos Grid */}
            <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredPhotos.slice(0, 8).map((photo, idx) => (
                <Reveal key={photo.id} delay={idx * 60} className="h-full">
                  <div
                    className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-card border border-border/60 transition-all duration-300 hover:border-gold/50 hover:shadow-lg cursor-pointer"
                    onClick={() => setActivePhoto(photo.url)}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                      <img
                        src={photo.url}
                        alt={`${photo.projectName} - ${photo.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      <span className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white/90 border border-white/10">
                        {photo.category}
                      </span>

                      <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-3.5">
                        <p className="font-display text-sm font-bold text-white line-clamp-1">
                          {photo.projectName}
                        </p>
                        <p className="text-[11px] text-white/70 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-gold shrink-0" />
                          <span>{photo.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-card flex items-center justify-between text-xs border-t border-border/40">
                      <span className="text-muted-foreground truncate">{photo.title}</span>
                      <Link
                        to="/projects/$slug"
                        params={{ slug: photo.projectSlug }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gold font-semibold hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Lightbox Modal */}
          {activePhoto && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
              onClick={() => setActivePhoto(null)}
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={activePhoto}
                alt="Project Photo Fullscreen"
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          )}
        </section>
      )}

      {/* ── The SLV Philosophy — dark royal ── */}
      <section
        className="relative overflow-hidden py-32 text-white"
        style={{ background: "var(--gradient-royal)" }}
      >
        {/* Background glow orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--color-gold)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "var(--color-gold)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="mb-20 text-center">
            <p className="section-label text-gold tracking-[0.35em]">Our Principles</p>
            <h2 className="mt-5 font-display text-5xl font-bold sm:text-6xl">The SLV Philosophy</h2>
            <div className="mx-auto mt-8 flex items-center justify-center gap-4">
              <div
                className="h-px w-12 opacity-50"
                style={{ background: "var(--gradient-gold)" }}
              />
              <div className="h-1.5 w-1.5 rotate-45 bg-gold opacity-70" />
              <div
                className="h-px w-12 opacity-50"
                style={{ background: "var(--gradient-gold)" }}
              />
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div
                  className="group relative h-full rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Hover gold glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.06), transparent)",
                    }}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(212,175,55,0.12)",
                        border: "1px solid rgba(212,175,55,0.2)",
                      }}
                    >
                      <f.icon className="h-6 w-6 text-gold" />
                    </div>
                    <div className="mt-6 font-display text-6xl italic font-bold text-gold/15">
                      {f.no}
                    </div>
                    <h3 className="mt-2 text-xl font-bold tracking-wide uppercase">{f.title}</h3>
                    <div
                      className="mt-4 h-px w-12 opacity-40"
                      style={{ background: "var(--gradient-gold)" }}
                    />
                    <p className="mt-4 font-light leading-relaxed text-white/60">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial — editorial ── */}
      <section className="relative overflow-hidden mx-auto max-w-5xl px-6 py-32 text-center">
        <Reveal>
          {/* Decorative quote mark */}
          <div className="relative inline-block">
            <Quote className="mx-auto h-12 w-12 text-gold opacity-90" />
            <div
              className="absolute inset-0 blur-xl opacity-30"
              style={{ background: "var(--color-gold)" }}
            />
          </div>

          {/* Gold ornament */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 opacity-40" style={{ background: "var(--gradient-gold)" }} />
            <div className="h-1 w-1 rotate-45 bg-gold opacity-60" />
            <div className="h-px w-16 opacity-40" style={{ background: "var(--gradient-gold)" }} />
          </div>

          <blockquote className="mt-10 font-display text-2xl font-semibold italic leading-snug text-foreground sm:text-4xl lg:text-5xl">
            "{featured.quote}"
          </blockquote>

          <div className="mt-12">
            <div
              className="mx-auto h-10 w-10 rounded-full"
              style={{ background: "var(--gradient-gold)", opacity: 0.3 }}
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              {featured.name}
            </p>
            <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              {featured.role}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA — split royal ── */}
      <section className="px-6 pb-24">
        <Reveal
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-10 py-20 text-white md:px-20"
          style={{
            background: "var(--gradient-royal)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Background glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-25"
            style={{ background: "var(--color-gold)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full blur-3xl opacity-10"
            style={{ background: "var(--color-gold)" }}
          />

          {/* Ornamental corners */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-8 top-8 h-8 w-8 border-l border-t opacity-30"
            style={{ borderColor: "var(--color-gold)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 bottom-8 h-8 w-8 border-r border-b opacity-30"
            style={{ borderColor: "var(--color-gold)" }}
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="max-w-2xl text-center md:text-left">
              <p className="section-label text-gold tracking-[0.3em]">Begin Your Journey</p>
              <h2 className="mt-5 font-display text-5xl font-bold sm:text-6xl lg:text-7xl">
                Your Future Awaits
              </h2>
              <p className="mt-6 text-lg font-light leading-relaxed text-white/65">
                Schedule a private viewing of our model homes and experience the pinnacle of luxury
                living in person.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="
        group
        flex items-center gap-3
        rounded-2xl
        border border-white/20
        px-10 py-5
        text-xs
        font-bold
        uppercase
        tracking-[0.2em]
        text-white
        shadow-2xl
        transition-all
        duration-300
        hover:scale-[1.04]
        hover:text-gold-foreground
        hover:shadow-gold/20
      "
              >
                <span
                  className="absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "var(--gradient-gold)" }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  Contact Us
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                to="/projects"
                search={{ status: "ongoing" }}
                className="group flex items-center gap-3 rounded-2xl border border-white/20 px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-gradient-gold hover:text-gold-foreground hover:border-gold"
              >
                Explore Projects
              </Link>
            </div>
          </div>

          {/* Official Social Media Channels */}
          <div className="relative z-10 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            <span className="text-xs uppercase tracking-widest text-white/60">
              Follow SLV Group on Official Social Channels:
            </span>
            <div className="flex items-center gap-3">
              {[SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:border-gold hover:bg-gold/20 hover:text-gold"
                    aria-label={social.ariaLabel}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
