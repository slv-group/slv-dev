import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PropertyCard } from "@/components/PropertyCard";
import {
  type ProjectCategory,
  type ProjectStatus,
  projects as staticProjects,
  LOCATIONS,
  matchesLocation,
} from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToProject } from "@/data/projects";
import { cn } from "@/lib/utils";
import { Search, MapPin, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — SLV Group" },
      {
        name: "description",
        content:
          "Explore ongoing, completed, and upcoming luxury villas, penthouses, and apartments by SLV Group.",
      },
      { property: "og:title", content: "Projects — SLV Group" },
      { property: "og:description", content: "Browse our curated portfolio of luxury residences." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { status?: string; location?: string } => ({
    status: search.status as string | undefined,
    location: search.location as string | undefined,
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
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStatus(getStatusFromSearch(search.status));
  }, [search.status]);

  useEffect(() => {
    setLocation(getLocationFromSearch(search.location));
  }, [search.location]);

  const handleStatusChange = (s: (typeof statusFilters)[number]) => {
    setStatus(s);
    navigate({
      search: {
        status: s === "All" ? undefined : s.toLowerCase(),
        location: location === "All" ? undefined : location.toLowerCase(),
      },
    });
  };

  const handleLocationChange = (l: LocationFilter) => {
    setLocation(l);
    navigate({
      search: {
        status: status === "All" ? undefined : status.toLowerCase(),
        location: l === "All" ? undefined : l.toLowerCase(),
      },
    });
  };

  const hasActiveFilters =
    status !== "All" || location !== "All" || category !== "All" || query.trim() !== "";

  const resetFilters = () => {
    setStatus("All");
    setLocation("All");
    setCategory("All");
    setQuery("");
    navigate({ search: {} });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (category === "All" || p.category === category) &&
        matchesLocation(p, location) &&
        (q === "" ||
          (p.name || "").toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q)),
    );
  }, [projects, status, category, location, query]);

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <p className="section-label text-gold">Our Portfolio</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
          Find Your Projects
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Refine by location, status, type, and price to discover the home that matches your aspirations.
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

        {/* Results count & active filter summary */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            residences
            {location !== "All" && (
              <span className="ml-1 text-gold font-medium">in {location}</span>
            )}
            {status !== "All" && (
              <span className="ml-1 text-muted-foreground">({status})</span>
            )}
            {category !== "All" && (
              <span className="ml-1 text-muted-foreground">• {category}</span>
            )}
          </p>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/80 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} project={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">
              No residences match these filters yet.
            </p>
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
