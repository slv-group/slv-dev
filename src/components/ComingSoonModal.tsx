import { useEffect } from "react";
import { X, Sparkles, MapPin, Building2, Calendar, Phone, ArrowLeft } from "lucide-react";
import type { Project } from "@/data/projects";
import { formatLocationCity } from "@/lib/country-codes";

interface ComingSoonModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ project, isOpen, onClose }: ComingSoonModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayBedrooms =
    (project.name?.toLowerCase().includes("green grandeur") ||
      project.slug === "slv-green-grandeur") &&
    (project.bedrooms.trim() === "G+2" || project.bedrooms.trim() === "G+2 ")
      ? "G+2 Villa"
      : project.bedrooms;

  const locationDisplay = formatLocationCity(project.location, project.city);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-gold/40 shadow-2xl neu p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Coming Soon dialog"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold" />
            Upcoming Project
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {project.category}
          </span>
        </div>

        {/* Project Name */}
        <h3
          id="coming-soon-modal-title"
          className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground"
        >
          {project.name}
        </h3>

        {/* Location */}
        {locationDisplay && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-gold" />
            <span>{locationDisplay}</span>
          </p>
        )}

        {/* Blurred Preview Image with Overlay */}
        <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/40 border border-border/50">
          {project.image ? (
            <img
              src={project.image}
              alt={project.name}
              className="h-full w-full object-cover blur-sm scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/40">
              <Building2 className="h-10 w-10 text-gold/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 flex flex-col items-center justify-center text-center p-4">
            <div className="rounded-full border border-gold/60 bg-black/80 px-4 py-2 backdrop-blur-md">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
                Coming Soon
              </p>
            </div>
            <p className="mt-2 text-xs text-white/80 max-w-xs">
              Project details, floor plans, and brochures will be published upon launch.
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Project Type
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold text-foreground">
              {displayBedrooms || project.category}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-0.5 font-display text-sm font-semibold text-gold">{project.status}</p>
          </div>
        </div>

        {/* Description / Info Box */}
        <div className="mt-4 rounded-xl bg-secondary/20 p-4 border border-border/40 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {project.description ||
            "This premium development by SLV Group is currently in active planning. Register your interest to receive priority updates on launch dates, unit pricing, and site availability."}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          <a
            href="https://wa.me/919949666646?text=Hello%20SLV%20Group,%20I%20am%20interested%20in%20the%20upcoming%20project:%20SLV%20Laila%20Towers."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-bold text-gold-foreground transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            Enquire Now
          </a>
        </div>
      </div>
    </div>
  );
}
