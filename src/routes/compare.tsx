import { createFileRoute, Link } from "@tanstack/react-router";
import { X, Scale } from "lucide-react";
import { useStore } from "@/store/useStore";
import { projects, formatPrice } from "@/data/projects";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Residences — SLV Group" },
      {
        name: "description",
        content:
          "Compare luxury residences side by side across price, area, amenities, and launch.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { compare, toggleCompare } = useStore();
  const selected = projects.filter((p) => compare.includes(p.id));

  if (selected.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card neu text-gold">
          <Scale className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
          No residences to compare
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Add up to 3 residences using the compare icon on any property card.
        </p>
        <Link
          to="/projects"
          search={{ status: undefined }}
          className="mt-6 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground"
        >
          Browse Projects
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (p: (typeof selected)[number]) => React.ReactNode }[] = [
    { label: "Price From", render: (p) => formatPrice(p.priceFrom) },
    { label: "Configurations", render: (p) => p.bedrooms },
    {
      label: "Area (sqft)",
      render: (p) => `${p.sqftFrom.toLocaleString()} - ${p.sqftTo.toLocaleString()}`,
    },
    { label: "Status", render: (p) => p.status },
    { label: "Location", render: (p) => `${p.location}, ${p.city}` },
    { label: "Launch", render: (p) => p.launchDate },
    { label: "Key Amenities", render: (p) => p.amenities.slice(0, 4).join(", ") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-32">
      <p className="section-label text-gold">Side by Side</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
        Compare Residences
      </h1>

      <div className="mt-10 overflow-x-auto">
        <div
          className="grid min-w-[640px] gap-4"
          style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
        >
          <div />
          {selected.map((p) => (
            <div key={p.id} className="relative overflow-hidden rounded-3xl bg-card neu">
              <button
                onClick={() => toggleCompare(p.id)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full glass"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
              <img src={p.image} alt={p.name} className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <p className="font-display text-lg font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.category}</p>
              </div>
            </div>
          ))}

          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div className="flex items-center rounded-2xl bg-background px-4 py-4 text-sm font-semibold text-foreground neu-pressed">
                {row.label}
              </div>
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center rounded-2xl bg-card px-4 py-4 text-sm text-muted-foreground neu-sm"
                >
                  {row.render(p)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
