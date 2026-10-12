import { supabase } from "./src/integrations/supabase/client.ts";

async function run() {
  const req = new Request("http://localhost:1234", {
    method: "POST",
    body: JSON.stringify({ a: 1 }),
  });
  try {
    const res = await fetch(req, { headers: { "x-test": "1" } });
  } catch (e) {
    console.error("Caught:", e instanceof Error ? e.message : String(e));
  }
}
run();
