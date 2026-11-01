import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";
import {
  Image as ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      {
        title: "Gallery — Architectural Renders & Photography | SLV Group",
      },
      {
        name: "description",
        content:
          "Explore the architectural gallery of SLV Group. View master layouts, elevations, day and night perspectives, and community developments across Andhra Pradesh.",
      },
      { property: "og:title", content: "Gallery — SLV Group" },
      {
        property: "og:description",
        content:
          "High-resolution architectural renders, master plans, and project photography from SLV Group.",
      },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { property: "og:url", content: "https://www.slvgroup.co.in/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Gallery — SLV Group" },
      {
        name: "twitter:description",
        content:
          "High-resolution architectural renders, master plans, and project photography from SLV Group.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/gallery",
      },
    ],
  }),
  component: GalleryPage,
});

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  category: string;
}

function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Fetch images from the Supabase gallery table
  const { data: dbGallery = [], isLoading } = useQuery({
    queryKey: ["public-gallery-images"],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id, title, image_url, category, is_published, sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching gallery:", error);
        return [];
      }
      return data ?? [];
    },
  });

  // Map images from the Supabase gallery table (never substitute static dummy projects)
  const allImages: GalleryImage[] = dbGallery.map((g) => ({
    id: g.id,
    title:
      (g.title || "").replace(/\.(jpg|jpeg|png|webp)$/i, "").replace(/^[A-Z]\s*\.\s*/, "") ||
      "Gallery Image",
    url: g.image_url,
    category: g.category || "Architecture",
  }));

  const categories = ["All", "Architecture", "Plots", "Apartment", "Commercial"];

  const filteredImages =
    selectedCategory === "All"
      ? allImages
      : allImages.filter((img) => img.category.toLowerCase() === selectedCategory.toLowerCase());

  const openLightbox = (index: number) => setActiveImageIndex(index);
  const closeLightbox = () => setActiveImageIndex(null);
  const nextImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % filteredImages.length);
    }
  };
  const prevImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Showcase
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Architectural Gallery
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Explore our master layouts, elevations, landscaped communities, and landmark
                developments across the Vijayawada and Amaravati region.
              </p>
            </div>
          </Reveal>

          {/* Category Filter Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  selectedCategory === cat
                    ? "bg-gold text-white shadow-md shadow-gold/20"
                    : "border border-border bg-card/60 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">No images found</p>
            <p className="text-sm text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((img, idx) => (
              <Reveal key={img.id} delay={Math.min(idx * 50, 400)}>
                <div
                  onClick={() => openLightbox(idx)}
                  className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs font-semibold tracking-wider text-gold uppercase">
                      {img.category}
                    </p>
                    <h3 className="line-clamp-1 text-sm font-medium">{img.title}</h3>
                  </div>
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && filteredImages[activeImageIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous image"
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer sm:left-8"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer sm:right-8"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredImages[activeImageIndex].url}
              alt={filteredImages[activeImageIndex].title}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-3 text-center text-white">
              <p className="text-sm font-semibold">{filteredImages[activeImageIndex].title}</p>
              <p className="text-xs text-white/60">
                {activeImageIndex + 1} of {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
