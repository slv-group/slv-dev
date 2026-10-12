import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PropertyCard } from "@/components/PropertyCard";
import {
  type ProjectCategory,
  type ProjectStatus,
  projects as staticProjects,
} from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToProject } from "@/data/projects";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
  validateSearch: (search: Record<string, unknown>) => ({
    status: search.status as string | undefined,
  }),
  loader: async () => {
    // Try to fetch any DB projects (admin-added)
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    let allProjects = [...staticProjects];

    if (data && data.length > 0) {
      const dbProjects = data.map(mapSupabaseToProject);
      // Build Sets of DB slugs and normalized names for fast lookup
      const dbSlugs = new Set(dbProjects.map((p) => p.slug));
      const dbNames = new Set(dbProjects.map((p) => p.name.toLowerCase().trim()));

      // Keep only static projects that DON'T have a DB counterpart (by slug OR name)
      allProjects = staticProjects.filter(
        (s) => !dbSlugs.has(s.slug) && !dbNames.has(s.name.toLowerCase().trim()),
      );

      // Append all DB projects (they take priority)
      allProjects.push(...dbProjects);
    }

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

function ProjectsPage() {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>("All");
  const [query, setQuery] = useState("");

  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { projects } = Route.useLoaderData();

  useEffect(() => {
    switch (search.status?.toLowerCase()) {
      case "ongoing":
        setStatus("Ongoing");
        break;

      case "completed":
        setStatus("Completed");
        break;

      case "upcoming":
        setStatus("Upcoming");
        break;

      default:
        setStatus("All");
    }
  }, [search.status]);

  const filtered = useMemo(() => {
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (category === "All" || p.category === category) &&
        (p.name || "").toLowerCase().includes(query.toLowerCase()),
    );
  }, [projects, status, category, query]);

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <p className="section-label text-gold">Our Portfolio</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
          Find Your Projects
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Refine by status, type, and price to discover the home that matches your aspirations.
        </p>

        {/* Filter bar */}
        <div className="mt-10 rounded-3xl bg-card p-6 neu space-y-6">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Search */}
            <div className="relative w-full max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                type="search"
                value={query}
                placeholder="Search project name..."
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
            <div className="flex flex-wrap gap-6">
              {/* Status */}
              <div>
                <p className="mb-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((s) => (
                    <FilterPill
                      key={s}
                      active={status === s}
                      onClick={() => {
                        navigate({
                          search: {
                            status: s === "All" ? undefined : s.toLowerCase(),
                          },
                        });
                      }}
                    >
                      {s}
                    </FilterPill>
                  ))}
                </div>
              </div>
              {/* Type */}
              <div>
                <p className="mb-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
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

        <p className="mt-8 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          residences
        </p>

        <div className="mt-6 grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} project={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">
            No residences match these filters yet.
          </p>
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
