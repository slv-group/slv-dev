import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import {
  projects as staticProjects,
  mapSupabaseToProject,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import { LOCATION_PAGES, getLocationPage, projectsForLocation } from "@/data/locations";
import { SITE_URL, faqJsonLd, jsonLd } from "@/lib/seo";

const statusOrder: Record<ProjectStatus, number> = { Ongoing: 1, Upcoming: 2, Completed: 3 };

export const Route = createFileRoute("/locations/$location")({
  loader: async ({ params }) => {
    const page = getLocationPage(params.location);
    if (!page) throw notFound();

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    const all: Project[] =
      data && data.length > 0 ? data.map(mapSupabaseToProject) : [...staticProjects];
    const projects = projectsForLocation(page, all).sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status],
    );
    return { page, projects };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    if (!page) return { meta: [{ title: "Locations — SLV Group" }] };
    const url = `${SITE_URL}/locations/${page.slug}`;
    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "SLV Group" },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:url", content: url },
        { property: "og:image", content: `${SITE_URL}/slv-logo.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: page.title },
        { name: "twitter:description", content: page.description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LocationPageView,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-display text-3xl font-bold">Location not found</h1>
      <Link to="/projects" search={{ status: undefined }} className="text-gold underline">
        View all projects
      </Link>
    </div>
  ),
});

function LocationPageView() {
  const { page, projects } = Route.useLoaderData();
  const url = `${SITE_URL}/locations/${page.slug}`;
  const ongoing = projects.filter((p) => p.status !== "Completed");
  const completed = projects.filter((p) => p.status === "Completed");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: page.h1,
        description: page.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@type": "Place", name: `${page.name}, Andhra Pradesh` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: projects.length,
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/projects/${p.slug}`,
            name: p.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
          { "@type": "ListItem", position: 3, name: page.name, item: url },
        ],
      },
    ],
  };

  return (
    <div className="pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      {page.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(page.faqs)) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden className="opacity-50">
              /
            </li>
            <li>
              <Link
                to="/projects"
                search={{ status: undefined }}
                className="hover:text-foreground transition-colors"
              >
                Projects
              </Link>
            </li>
            <li aria-hidden className="opacity-50">
              /
            </li>
            <li aria-current="page" className="text-foreground/80">
              {page.name}
            </li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="section-label text-gold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {page.name}, Andhra Pradesh
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {page.h1}
          </h1>
          {page.intro.map((para) => (
            <p key={para} className="mt-4 text-base leading-relaxed text-muted-foreground">
              {para}
            </p>
          ))}
          <p className="mt-4 text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"} · {ongoing.length} ongoing ·{" "}
            {completed.length} completed
          </p>
        </header>

        {ongoing.length > 0 && (
          <section className="mt-12" aria-labelledby="ongoing-heading">
            <h2
              id="ongoing-heading"
              className="font-display text-2xl font-semibold text-foreground"
            >
              Ongoing projects in {page.name}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ongoing.map((p) => (
                <PropertyCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="mt-14" aria-labelledby="completed-heading">
            <h2
              id="completed-heading"
              className="font-display text-2xl font-semibold text-foreground"
            >
              Completed projects in {page.name}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((p) => (
                <PropertyCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        {page.faqs.length > 0 && (
          <section className="mt-16 max-w-3xl" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-display text-2xl font-semibold text-foreground">
              Frequently asked questions
            </h2>
            <dl className="mt-6 space-y-5">
              {page.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl bg-card p-5 neu-sm">
                  <dt className="font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mt-16" aria-labelledby="other-locations">
          <h2 id="other-locations" className="font-display text-xl font-semibold text-foreground">
            Other locations
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {LOCATION_PAGES.filter((l) => l.slug !== page.slug).map((l) => (
              <li key={l.slug}>
                <Link
                  to="/locations/$location"
                  params={{ location: l.slug }}
                  className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-gold hover:text-gold transition-colors"
                >
                  Projects in {l.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/site-visit"
              className="inline-flex rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground"
            >
              Book a site visit
            </Link>
            <Link
              to="/contact"
              className="inline-flex rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-gold"
            >
              Contact us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
