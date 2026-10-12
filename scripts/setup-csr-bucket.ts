/**
 * One-time setup script: creates CSR-media storage bucket and
 * updates existing csr_activities image URLs in the remote Supabase DB.
 *
 * Usage:  npx tsx scripts/setup-csr-bucket.ts
 *
 * Requires SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env manually
const envPath = path.resolve(import.meta.dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("🔧 Setting up CSR-media storage bucket...\n");

  // 1. Try to create the CSR-media bucket
  console.log("1️⃣  Creating CSR-media bucket...");
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(
    "CSR-media",
    {
      public: true,
      fileSizeLimit: 52428800, // 50 MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    },
  );

  if (bucketError) {
    if (bucketError.message?.includes("already exists")) {
      console.log("   ✅ CSR-media bucket already exists.\n");
    } else {
      console.error("   ⚠️  Could not create bucket:", bucketError.message);
      console.log("   → You may need to create it manually in the Supabase Dashboard.");
      console.log("   → Go to: Storage > New Bucket > Name: CSR-media, Public: true\n");
    }
  } else {
    console.log("   ✅ CSR-media bucket created successfully!\n");
  }

  // 2. Fix image URLs in csr_activities table
  console.log("2️⃣  Checking CSR activities image URLs...");
  const { data: activities, error: fetchError } = await supabase
    .from("csr_activities")
    .select("id, title, image_url")
    .order("sort_order", { ascending: true });

  if (fetchError) {
    console.error("   ❌ Error fetching activities:", fetchError.message);
    return;
  }

  if (!activities || activities.length === 0) {
    console.log("   ℹ️  No CSR activities found in database.\n");
    return;
  }

  console.log(`   Found ${activities.length} activities.\n`);

  let updatedCount = 0;
  for (const activity of activities) {
    const oldUrl = activity.image_url;
    if (oldUrl && oldUrl.startsWith("/src/assets/")) {
      const newUrl = oldUrl.replace("/src/assets/", "/assets/");
      const { error: updateError } = await supabase
        .from("csr_activities")
        .update({ image_url: newUrl })
        .eq("id", activity.id);

      if (updateError) {
        console.error(`   ❌ Failed to update "${activity.title}":`, updateError.message);
      } else {
        console.log(`   ✅ Updated: "${activity.title}"`);
        console.log(`      ${oldUrl} → ${newUrl}`);
        updatedCount++;
      }
    } else {
      console.log(`   ⏭️  Skipped: "${activity.title}" (URL already correct or external)`);
    }
  }

  console.log(`\n🎉 Done! Updated ${updatedCount} image URLs.\n`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
