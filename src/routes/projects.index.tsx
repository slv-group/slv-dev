import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PropertyCard } from "@/components/PropertyCard";
import {
  type ProjectCategory,
  type ProjectStatus,
  type Project,
  projects as staticProjects,
  LOCATIONS,
  matchesLocation,
} from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToProject } from "@/data/projects";
import { cn } from "@/lib/utils";
import { Search, MapPin, RotateCcw, BedDouble, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Residential Projects & Open Plots in Vijayawada & Amaravati — SLV Group" },
      {
        name: "description",
        content:
          "Explore ongoing, upcoming, and completed residential gated communities, open plots, and commercial projects across Vijayawada, Guntur, and the Amaravati region by SLV Group.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "Projects Portfolio — SLV Group" },
      {
        property: "og:description",
        content:
          "Browse our portfolio of plotted developments, residential communities, and commercial landmarks in Vijayawada and Amaravati.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/projects" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Projects Portfolio — SLV Group" },
      {
        name: "twitter:description",
        content:
          "Browse our portfolio of plotted developments, residential communities, and commercial landmarks in Vijayawada and Amaravati.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/projects",
      },
    ],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    status?: string;
    location?: string;
    spec?: string;
    sort?: string;
  } => ({
    status: search.status as string | undefined,
    location: search.location as string | undefined,
    spec: search.spec as string | undefined,
    sort: search.sort as string | undefined,
  }),
  loader: async () => {
    // Try to fetch any DB projects (admin-added)
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    const allProjects =
      data && data.length > 0 ? data.map(mapSupabaseToProject) : [...staticProjects];

    // Sort projects: Ongoing → Upcoming → Completed
    const statusOrder: Record<ProjectStatus, number> = {
      Ongoing: 1,
      Upcoming: 2,
      Completed: 3,
    };

    allProjects.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return { projects: allProjects };
  },
  component: ProjectsPage,
});

const statusFilters: (ProjectStatus | "All")[] = ["All", "Ongoing", "Upcoming", "Completed"];
const categoryFilters: (ProjectCategory | "All")[] = [
  "All",
  "Apartment",
  "Villa",
  "Plots",
  "Commercial",
];
const locationFilters = ["All", ...LOCATIONS] as const;
type LocationFilter = (typeof locationFilters)[number];

const specFilters = ["All", "2 BHK", "3 BHK", "4+ BHK", "Plots", "Commercial"] as const;
type SpecFilter = (typeof specFilters)[number];

const sortOptions = [
  { value: "default", label: "Default Order" },
  { value: "location-asc", label: "Location (A – Z)" },
  { value: "area-asc", label: "Specification: Area (Low to High)" },
  { value: "area-desc", label: "Specification: Area (High to Low)" },
] as const;
type SortOption = (typeof sortOptions)[number]["value"];

function getStatusFromSearch(searchStatus?: string): (typeof statusFilters)[number] {
  switch (searchStatus?.toLowerCase()) {
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    case "upcoming":
      return "Upcoming";
    default:
      return "All";
  }
}

function getLocationFromSearch(searchLocation?: string): LocationFilter {
  if (!searchLocation) return "All";
  const normalized = searchLocation.toLowerCase().trim();
  const match = locationFilters.find((loc) => loc.toLowerCase() === normalized);
  if (match) return match;
  if (normalized === "amaravati") return "Amaravathi";
  if (normalized === "guntupalli") return "Gunthapalli";
  return "All";
}

function getSpecFromSearch(searchSpec?: string): SpecFilter {
  if (!searchSpec) return "All";
  const match = specFilters.find((s) => s.toLowerCase() === searchSpec.toLowerCase());
  return match || "All";
}

function matchesSpec(p: Project, spec: SpecFilter): boolean {
  if (spec === "All") return true;
  const bedrooms = (p.bedrooms || "").toLowerCase();
  const category = (p.category || "").toLowerCase();
  if (spec === "2 BHK") {
    return bedrooms.includes("2") || /2\s*bhk/i.test(p.name);
  }
  if (spec === "3 BHK") {
    return bedrooms.includes("3") || /3\s*bhk/i.test(p.name);
  }
  if (spec === "4+ BHK") {
    return (
      bedrooms.includes("4") ||
      bedrooms.includes("5") ||
      category.includes("villa") ||
      /4\s*bhk/i.test(p.name)
    );
  }
  if (spec === "Plots") {
    return category === "plots" || /plot|land/i.test(bedrooms);
  }
  if (spec === "Commercial") {
    return category === "commercial" || /commercial/i.test(bedrooms);
  }
  return true;
}

function ProjectsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { projects } = Route.useLoaderData();

  const [status, setStatus] = useState<(typeof statusFilters)[number]>(() =>
    getStatusFromSearch(search.status),
  );
  const [location, setLocation] = useState<LocationFilter>(() =>
    getLocationFromSearch(search.location),
  );
  const [spec, setSpec] = useState<SpecFilter>(() =>
    getSpecFromSearch(search.spec),
  );
  const [sortBy, setSortBy] = useState<SortOption>(() =>
    (search.sort as SortOption) || "default",
  );
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStatus(getStatusFromSearch(search.status));
  }, [search.status]);

  useEffect(() => {
    setLocation(getLocationFromSearch(search.location));
  }, [search.location]);

  useEffect(() => {
    setSpec(getSpecFromSearch(search.spec));
  }, [search.spec]);

  useEffect(() => {
    if (search.sort && sortOptions.some((o) => o.value === search.sort)) {
      setSortBy(search.sort as SortOption);
    }
  }, [search.sort]);

  const handleStatusChange = (s: (typeof statusFilters)[number]) => {
    setStatus(s);
    navigate({
      search: {
        status: s === "All" ? undefined : s.toLowerCase(),
        location: location === "All" ? undefined : location.toLowerCase(),
        spec: spec === "All" ? undefined : spec.toLowerCase(),
        sort: sortBy === "default" ? undefined : sortBy,
      },
    });
  };

  const handleLocationChange = (l: LocationFilter) => {
    setLocation(l);
    navigate({
      search: {
        status: status === "All" ? undefined : status.toLowerCase(),
        location: l === "All" ? undefined : l.toLowerCase(),
        spec: spec === "All" ? undefined : spec.toLowerCase(),
        sort: sortBy === "default" ? undefined : sortBy,
      },
    });
  };

  const handleSpecChange = (sp: SpecFilter) => {
    setSpec(sp);
    navigate({
      search: {
        status: status === "All" ? undefined : status.toLowerCase(),
        location: location === "All" ? undefined : location.toLowerCase(),
        spec: sp === "All" ? undefined : sp.toLowerCase(),
        sort: sortBy === "default" ? undefined : sortBy,
      },
    });
  };

  const handleSortChange = (so: SortOption) => {
    setSortBy(so);
    navigate({
      search: {
        status: status === "All" ? undefined : status.toLowerCase(),
        location: location === "All" ? undefined : location.toLowerCase(),
        spec: spec === "All" ? undefined : spec.toLowerCase(),
        sort: so === "default" ? undefined : so,
      },
    });
  };

  const hasActiveFilters =
    status !== "All" ||
    location !== "All" ||
    category !== "All" ||
    spec !== "All" ||
    sortBy !== "default" ||
    query.trim() !== "";

  const resetFilters = () => {
    setStatus("All");
    setLocation("All");
    setCategory("All");
    setSpec("All");
    setSortBy("default");
    setQuery("");
    navigate({ search: {} });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result = projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (category === "All" || p.category === category) &&
        matchesLocation(p, location) &&
        matchesSpec(p, spec) &&
        (q === "" ||
          (p.name || "").toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q)),
    );

    if (sortBy === "location-asc") {
      result.sort((a, b) =>
        (a.location || a.city || "").localeCompare(b.location || b.city || ""),
      );
    } else if (sortBy === "area-asc") {
      result.sort((a, b) => (a.sqftFrom || 0) - (b.sqftFrom || 0));
    } else if (sortBy === "area-desc") {
      result.sort((a, b) => (b.sqftFrom || 0) - (a.sqftFrom || 0));
    }

    return result;
  }, [projects, status, category, location, spec, sortBy, query]);

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <p className="section-label text-gold">Our Portfolio</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
          Find Your Projects
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Refine by location, specification, status, and type to discover the home that matches your
          aspirations.
        </p>

        {/* Filter bar */}
        <div className="mt-10 rounded-3xl bg-card p-6 sm:p-7 neu space-y-6">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative w-full max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                type="search"
                value={query}
                placeholder="Search project name, city, or location..."
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Groups */}
            <div className="flex flex-col gap-5">
              {/* Locations */}
              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Our Locations
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locationFilters.map((l) => (
                    <FilterPill
                      key={l}
                      active={location === l}
                      onClick={() => handleLocationChange(l)}
                    >
                      {l}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Specifications & Configurations */}
              <div className="pt-4 border-t border-border/40">
                <div className="mb-2 flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-gold" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Specifications & Configuration
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specFilters.map((sp) => (
                    <FilterPill
                      key={sp}
                      active={spec === sp}
                      onClick={() => handleSpecChange(sp)}
                    >
                      {sp}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Status and Type row */}
              <div className="flex flex-wrap gap-8 pt-4 border-t border-border/40">
                {/* Status */}
                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((s) => (
                      <FilterPill
                        key={s}
                        active={status === s}
                        onClick={() => handleStatusChange(s)}
                      >
                        {s}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((c) => (
                      <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>
                        {c}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count & active filter summary & Arrange By */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            residences
            {location !== "All" && (
              <span className="ml-1 text-gold font-medium">in {location}</span>
            )}
            {spec !== "All" && (
              <span className="ml-1 text-gold font-medium">• {spec}</span>
            )}
            {status !== "All" && <span className="ml-1 text-muted-foreground">({status})</span>}
            {category !== "All" && <span className="ml-1 text-muted-foreground">• {category}</span>}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-card border border-border/70 px-3 py-1.5 text-xs text-muted-foreground neu-sm">
              <ArrowUpDown className="h-3.5 w-3.5 text-gold" />
              <span className="font-semibold text-foreground/80">Arrange:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                aria-label="Arrange projects by"
                className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} project={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No residences match these filters yet.</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium text-gold hover:bg-gold/20 transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-gradient-obsidian text-background"
          : "text-muted-foreground neu-sm hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
