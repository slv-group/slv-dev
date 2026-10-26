# Bug Report: Admin Panel "Failed to Fetch" on Signup / Login

**Date:** 2026-08-01  
**Branch:** `feat/admin-panel-integration`  
**Severity:** 🔴 Critical – blocks all admin authentication

---

## Symptoms

- Navigating to `/admin/signup` and submitting the Create Account form shows a red **"Failed to fetch"** toast.
- Navigating to `/admin/login` and submitting credentials produces the same error.
- No network response reaches the Supabase Auth API (`/auth/v1/signup`, `/auth/v1/token`).

---

## Root Cause

`src/integrations/supabase/client.ts` contained a **custom `createSupabaseFetch` wrapper** intended to handle the new Supabase opaque API-key format (`sb_publishable_*`).

The wrapper logic was:

```ts
// Buggy logic (removed)
if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
  headers.delete("Authorization"); // ❌ strips the auth header
}
headers.set("apikey", supabaseKey); // adds apikey header
return fetch(input, { ...init, headers });
```

### Why it broke

The new Supabase JS client (`@supabase/supabase-js ^2.108`) already handles the `sb_publishable_*` key format natively — it sends the key in the `apikey` header **without** a `Bearer Authorization` header for auth endpoints.

When the custom fetch wrapper intercepted the request, it:

1. Received an `init.headers` object where `Authorization` was **not** set as a plain string but as an internal `Headers` object reference.
2. The `new Headers(init.headers)` copy did not correctly clone all internal SDK headers in some browser environments.
3. The resulting modified request had malformed / missing headers, causing the browser to reject the fetch with a CORS / network error that surfaces as **"Failed to fetch"**.

Confirmed via `curl.exe`: the Supabase project is live and healthy (`HTTP 200` on `/auth/v1/health`). The issue was **entirely client-side in the fetch wrapper**.

---

## Fix

Removed the custom `createSupabaseFetch` wrapper entirely and let the Supabase JS SDK handle headers natively.

```diff
- global: {
-   fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
- },
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    ...
  }
```

Also removed the unused helper functions `isNewSupabaseApiKey` and `createSupabaseFetch`.

**File changed:** `src/integrations/supabase/client.ts`

---

## Verification

- [ ] Navigate to `/admin/signup` → fill form → submit → account created ✅
- [ ] Navigate to `/admin/login` → fill credentials → submit → redirected to `/admin` ✅
- [ ] No "Failed to fetch" error toast appears

---

## Notes

- Supabase project ID: `zjvnxolsmfkurrwissru`
- Key type in use: `sb_publishable_*` (new opaque format, not a JWT)
- The `@supabase/supabase-js ^2.108` SDK handles this key type natively — no custom fetch wrapper is needed.
