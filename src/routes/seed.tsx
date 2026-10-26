import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/seed")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: SeedPage,
});

function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSeed = async () => {
    setLoading(true);
    setResult("Seeding...");

    try {
      let successCount = 0;

      for (const project of projects) {
        const payload = {
          slug: project.slug,
          name: project.name,
          tagline: project.tagline,
          category: project.category,
          status: project.status,
          location: project.location,
          city: project.city,
          price_from: project.priceFrom,
          bedrooms: project.bedrooms,
          sqft_from: project.sqftFrom,
          sqft_to: project.sqftTo,
          launch_date: project.launchDate,
          cover_image: project.image,
          gallery: project.gallery,
          description: project.description,
          amenities: project.amenities,
          specifications: project.specifications,
          nearby: project.proximity,
          floor_plans: project.floorPlans,
          brochure_url: project.brochureUrl,
          is_published: true, // Auto publish so they appear on UI
          sort_order: parseInt(project.id) || 0,
        };

        const { error } = await supabase.from("projects").upsert(payload, { onConflict: "slug" });

        if (error) {
          console.error("Error inserting", project.name, error);
        } else {
          successCount++;
        }
      }

      setResult(`Successfully seeded ${successCount} projects to the database!`);
    } catch (err: any) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 px-6 max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Seed Database</h1>
      <p className="text-muted-foreground">
        Click the button below to migrate all {projects.length} static projects from{" "}
        <code>projects.ts</code> into your live Supabase database.
      </p>

      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-gold text-white px-4 py-3 rounded-xl font-bold hover:bg-gold/80 disabled:opacity-50"
      >
        {loading ? "Seeding Data..." : "Seed All Static Projects"}
      </button>

      {result && <p className="font-mono text-sm bg-muted p-4 rounded-lg">{result}</p>}
    </div>
  );
}
