import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Maximize, BedDouble, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { formatPrice, type Project } from "@/data/projects";

const statusStyles: Record<string, string> = {
  Ongoing: "bg-gold/20 text-gold-foreground border-gold/40",
  Completed: "bg-emerald-500/15 text-gold-foreground border-emerald-500/30",
  Upcoming: "bg-blue-500/15 text-gold-foreground border-blue-500/30",
};

export function PropertyCard({ project }: { project: Project }) {
  const { isWishlisted, toggleWishlist } = useStore();
  const wished = isWishlisted(project.id);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(212,175,55,0.18),0_8px_24px_-8px_rgba(0,0,0,0.15)]"
      style={{
        border: "1px solid color-mix(in oklab, var(--color-gold) 12%, var(--color-border))",
      }}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
        />
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6), rgba(180,130,30,0.04), transparent)",
          }}
        />
        {/* Gold accent bar slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-gold transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />

        {/* Status badge */}
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-md",
            statusStyles[project.status],
          )}
        >
          {project.status}
        </span>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(project.id)}
          aria-label="Toggle wishlist"
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
            wished
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              : "glass border-white/30 text-white hover:bg-rose-500/20 hover:text-rose-300",
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              wished && "fill-white scale-110",
            )}
          />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/60">
            {project.category}
          </p>
          {/* <p className="font-display text-2xl font-semibold text-white">
            {formatPrice(project.priceFrom)}
            <span className="text-base font-light text-white/60">+</span>
          </p> */}
        </div>
      </div>

      {/* Card body */}
      <div className="relative flex flex-1 flex-col justify-between p-5">
        {/* Inner gold hairline at top */}
        <div
          className="absolute inset-x-5 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-gold) 30%, transparent), transparent)",
          }}
        />

        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-gradient-gold transition-all duration-300">
            {project.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-gold)" }} />
            {project.location}, {project.city}
          </p>

          {/* Specs */}
          {project.status === "Ongoing" && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
              <div
                className="flex h-10 items-center gap-1.5 rounded-xl bg-secondary/50 px-2.5 text-xs text-muted-foreground min-w-0"
                title={project.bedrooms}
              >
                <BedDouble className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-gold)" }} />
                <span className="font-medium truncate whitespace-nowrap">{project.bedrooms}</span>
              </div>
              <div
                className="flex h-10 items-center gap-1.5 rounded-xl bg-secondary/50 px-2.5 text-xs text-muted-foreground min-w-0"
                title={`${project.sqftFrom.toLocaleString()}+ ${project.areaUnit || (project.category === "Plots" ? "sq yd" : "sqft")}`}
              >
                <Maximize className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-gold)" }} />
                <span className="font-medium truncate whitespace-nowrap">
                  {project.sqftFrom.toLocaleString()}+ {project.areaUnit || (project.category === "Plots" ? "sq yd" : "sqft")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="group/btn relative overflow-hidden flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-gold-foreground shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            style={{ background: "var(--gradient-gold)" }}
          >
            <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 animate-shimmer" />
            <span className="relative flex items-center justify-center gap-2">
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
