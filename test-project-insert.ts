import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(path.resolve(".env"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val) {
    env[key.trim()] = val.join("=").trim().replace(/['"]/g, "");
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
  const payload = {
    name: "Test Project",
    slug: "test-project-" + Date.now(),
    tagline: "Test",
    description: "Test",
    status: "Ongoing",
    category: "Apartment",
    city: "Test City",
    location: "Test Loc",
    bedrooms: "2 BHK",
    price_from: 1000000,
    sqft_from: 1000,
    sqft_to: 2000,
    launch_date: "2024",
    rera_number: "RERA123",
    cover_image: "url",
    brochure_url: "url",
    map_embed: "url",
    amenities: ["Pool"],
    gallery: ["url"],
    specifications: [{ label: "Structure", value: "RCC" }],
    nearby: [{ label: "Hospital", distance: "2km" }],
    floor_plans: [{ type: "2 BHK", sqft: 1000, image: "url" }],
    is_featured: false,
    is_published: true,
    sort_order: 0,
  };

  const { error, data } = await supabase.from("projects").insert(payload);
  if (error) {
    console.error("Error inserting:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success");
  }
}

testInsert();
