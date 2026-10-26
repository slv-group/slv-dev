import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/seed")({
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
      let skippedCount = 0;

      // Fetch existing projects to protect them
      const { data: existing } = await supabase.from("projects").select("slug, name");
      const existingSlugs = new Set((existing || []).map((e) => e.slug));
      const existingNames = new Set((existing || []).map((e) => (e.name || "").toLowerCase().trim()));

      for (const project of projects) {
        if (existingSlugs.has(project.slug) || existingNames.has(project.name.toLowerCase().trim())) {
          skippedCount++;
          continue; // Never overwrite an existing project or its uploaded images!
        }

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

        const { error } = await supabase.from("projects").insert(payload);

        if (error) {
          console.error("Error inserting", project.name, error);
        } else {
          successCount++;
        }
      }

      setResult(`Done! Added ${successCount} missing projects. ${skippedCount} existing projects & their images were safely preserved.`);
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
