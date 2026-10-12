import { supabase } from "./src/integrations/supabase/client.ts";

async function run() {
  try {
    const res = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

run();
