import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToProject, projects as staticProjects } from "@/data/projects";
import { PropertyCard } from "@/components/PropertyCard";
import { MapPin, ArrowRight } from "lucide-react";
import { SiteVisitModal } from "@/components/SiteVisitModal";

export const Route = createFileRoute("/site-visit")({
  head: () => ({
    meta: [
      { title: "Book a Site Visit — SLV Group" },
      {
        name: "description",
        content:
          "Schedule a private viewing of our ongoing luxury residential and commercial projects.",
      },
    ],
  }),
  loader: async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("status", "Ongoing")
      .order("sort_order", { ascending: true });

    const allProjects =
      data && data.length > 0 ? data.map(mapSupabaseToProject) : [...staticProjects];

    // Filter to only ongoing projects for this page
    const ongoingProjects = allProjects.filter(
      (p) => p.status === "Ongoing" || p.status === "Upcoming",
    );
    return { projects: ongoingProjects };
  },
  component: SiteVisitPage,
});

function SiteVisitPage() {
  const { projects } = Route.useLoaderData();

  return (
    <div className="pt-24 pb-24 min-h-screen bg-background">
      <section className="relative px-6 pt-12 pb-16 text-center lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl relative z-10 animate-fade-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground mb-6 shadow-lg shadow-gold/20">
            <MapPin className="h-7 w-7" />
          </span>
          <p className="section-label text-gold mb-4 inline-block">Experience Luxury</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Book a Site Visit
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Choose from our exclusive ongoing projects below and schedule a private viewing at your
            convenience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="relative group/card">
              <PropertyCard project={p} />
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No ongoing projects available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
