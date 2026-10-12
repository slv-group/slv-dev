import { supabase } from "../src/integrations/supabase/client";
import { projects } from "../src/data/projects";

async function seed() {
  console.log(`Starting seed of ${projects.length} static projects...`);
  let successCount = 0;

  for (const project of projects) {
    const payload = {
      slug: project.slug,
      name: project.name,
      tagline: project.tagline || null,
      category: project.category,
      status: project.status,
      location: project.location || null,
      city: project.city || null,
      price_from: project.priceFrom || null,
      bedrooms: project.bedrooms || null,
      sqft_from: project.sqftFrom || null,
      sqft_to: project.sqftTo || null,
      launch_date: project.launchDate || null,
      cover_image: project.image || null,
      gallery: project.gallery || [],
      description: project.description || null,
      amenities: project.amenities || [],
      specifications: project.specifications || [],
      nearby: project.proximity || [],
      floor_plans: project.floorPlans || [],
      brochure_url: project.brochureUrl || null,
      is_published: true,
      sort_order: parseInt(project.id) || 0,
    };

    const { error } = await supabase.from("projects").upsert(payload, { onConflict: "slug" });

    if (error) {
      console.error("Failed to insert:", project.name, error);
    } else {
      successCount++;
    }
  }

  console.log(`Successfully seeded ${successCount} projects into Supabase!`);
}

seed();
