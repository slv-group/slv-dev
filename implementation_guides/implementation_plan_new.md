# 6A. Custom API — CRM/ERP Integration — Implementation Plan

> **Project**: SLV Builders & Developers — Website (slv-dev)
> **Branch**: `feat/admin-panel-integration`
> **Date**: 15 Aug 2026
> **Author**: Dev Team (Auto-Generated Audit)

---

## Executive Summary

This document maps every line-item from the **Section 6A — Custom API / CRM-ERP Integration** requirements checklist against our current codebase, clearly marking what is **DONE**, what is **PARTIAL**, and what is **NOT DONE**. Each "NOT DONE" item includes exact implementation steps so the team can pick it up without guesswork.

---

## Current Architecture (Quick Reference)

| Layer | Tech | Key Files |
|---|---|---|
| Frontend | React 19 + TanStack Router + Vite | [`src/routes/`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes) |
| Backend API | TanStack Start (SSR + Server Handlers) | [`src/routes/api/`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/api) |
| Database | Supabase (PostgreSQL + RLS) | [`src/integrations/supabase/`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/integrations/supabase) |
| Auth | Supabase Auth + JWT Bearer tokens | [`auth-middleware.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/integrations/supabase/auth-middleware.ts) |
| Server Entry | Cloudflare Workers | [`src/server.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/server.ts) |
| DB Schema Types | Auto-generated | [`types.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/integrations/supabase/types.ts) |

---

## Checklist Status — Line by Line

---

### 6A.1 — Build custom API endpoints for each form

| | |
|---|---|
| **Expected** | Yes |
| **Status** | ⚠️ PARTIAL |

#### What EXISTS today

| Form | How it submits | Is it a server API endpoint? |
|---|---|---|
| **Contact / Enquiry** ([`contact.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/contact.tsx)) | Client-side `supabase.from("leads").insert(...)` | ❌ No — direct client-to-Supabase |
| **Careers** ([`careers.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/careers.tsx)) | Client-side UI only (no DB insert found) | ❌ No endpoint, no DB write |
| **Vendor/Supplier Registration** ([`vendors-suppliers-registration.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/vendors-suppliers-registration.tsx)) | Client-side `supabase.from("work_registrations").insert(...)` via [`WorkRegistrationForm`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/components/registration/WorkingRegistrationForm.tsx) | ❌ No — direct client-to-Supabase |
| **Contractor Registration** ([`contractor-registration.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/contractor-registration.tsx)) | Same as Vendor (via `WorkRegistrationForm`) | ❌ No — direct client-to-Supabase |
| **Architect/Consultant Registration** ([`architect-consultant-registration.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/architect-consultant-registration.tsx)) | Same as Vendor (via `WorkRegistrationForm`) | ❌ No — direct client-to-Supabase |
| **NRI Enquiry** | ❌ No form page exists | ❌ Not built |
| **Site Visit Booking** | ❌ No dedicated form page (source enum `"site_visit"` exists but no form) | ❌ Not built |
| **Chat API** ([`api/chat.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/api/chat.ts)) | Server-side POST handler | ✅ Yes — proper API route |

#### What NEEDS to be done

> [!IMPORTANT]
> All forms currently use **direct client-to-Supabase inserts**. For CRM/ERP integration, we need **dedicated server-side API routes** (`POST /api/leads/contact`, `POST /api/leads/career`, etc.) so external systems can hit our endpoints without needing Supabase credentials.

**Action Items:**
1. Create `src/routes/api/leads/contact.ts` — `POST /api/leads/contact`
2. Create `src/routes/api/leads/career.ts` — `POST /api/leads/career`
3. Create `src/routes/api/leads/site-visit.ts` — `POST /api/leads/site-visit`
4. Create `src/routes/api/leads/nri.ts` — `POST /api/leads/nri`
5. Create `src/routes/api/registrations/vendor.ts` — `POST /api/registrations/vendor`
6. Create `src/routes/api/registrations/contractor.ts` — `POST /api/registrations/contractor`
7. Create `src/routes/api/registrations/architect.ts` — `POST /api/registrations/architect`
8. Each endpoint should: validate payload → insert into Supabase via `supabaseAdmin` (server-side) → return JSON response
9. Refactor existing frontend forms to call these API endpoints instead of direct Supabase inserts

---

### 6A.2 — Specify API response format (JSON — standard REST)

| | |
|---|---|
| **Expected** | JSON — standard REST |
| **Status** | ⚠️ PARTIAL |

#### What EXISTS
- The existing [`/api/chat`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/routes/api/chat.ts) returns a streaming response (not standard REST JSON).
- Form submissions go directly to Supabase (client returns Supabase's raw response objects).

#### What NEEDS to be done
All new API endpoints must follow this standard response format:

```json
// ✅ Success (201 Created)
{
  "success": true,
  "data": { "id": "uuid", "created_at": "..." },
  "message": "Lead submitted successfully"
}

// ❌ Validation Error (400)
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Phone number is required",
  "fields": { "phone": "Required field" }
}

// ❌ Server Error (500)
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Something went wrong"
}
```

**Action Items:**
1. Create a shared response helper: `src/lib/api-response.ts` with `apiSuccess()`, `apiError()`, `apiValidationError()` utilities
2. Apply consistently to all new endpoints

---

### 6A.3 — Provide dedicated API endpoints for each form (Contact, NRI, Site Visit, Careers, Vendor, etc.)

| | |
|---|---|
| **Expected** | Yes — Contact, NRI, Site Visit, Careers, Vendor, etc. |
| **Status** | ❌ NOT DONE |

#### What EXISTS
Only 1 API endpoint exists: `/api/chat` (AI chatbot — not a form submission endpoint).

#### DB Tables Ready

| Table | Purpose | Exists? |
|---|---|---|
| `leads` | Contact / NRI / Site Visit / Brochure / Career enquiries | ✅ Yes |
| `work_registrations` | Vendor / Contractor / Architect registrations | ✅ Yes |
| `job_applications` | Career applications (with resume) | ✅ Yes |
| `job_openings` | Job listings | ✅ Yes |

#### Lead Source Enum Already Defined
```typescript
// Already in types.ts — no schema change needed
lead_source: "hero" | "project_enquiry" | "brochure" | "contact" | "careers" | "site_visit"
```

> [!TIP]
> The `lead_source` enum may need to be extended to add `"nri"` if we want NRI enquiries tracked separately.

#### Full Endpoint Map (To Be Created)

| # | Endpoint | Method | DB Table | Source |
|---|---|---|---|---|
| 1 | `/api/leads/contact` | POST | `leads` | `contact` |
| 2 | `/api/leads/nri` | POST | `leads` | `nri` (new enum) |
| 3 | `/api/leads/site-visit` | POST | `leads` | `site_visit` |
| 4 | `/api/leads/career` | POST | `job_applications` | `careers` |
| 5 | `/api/leads/brochure` | POST | `leads` | `brochure` |
| 6 | `/api/leads/project-enquiry` | POST | `leads` | `project_enquiry` |
| 7 | `/api/registrations/vendor` | POST | `work_registrations` | `vendor_supplier` |
| 8 | `/api/registrations/contractor` | POST | `work_registrations` | `contractor` |
| 9 | `/api/registrations/architect` | POST | `work_registrations` | `architect_consultant` |

---

### 6A.4 — Provide API documentation to client's tech team

| | |
|---|---|
| **Expected** | Yes — full documentation |
| **Status** | ❌ NOT DONE |

#### What EXISTS
- Only 1 doc exists: [`docs/bugfix-admin-failed-to-fetch.md`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/docs/bugfix-admin-failed-to-fetch.md) (internal bug fix notes)
- No API documentation whatsoever

#### What NEEDS to be done

**Action Items:**
1. Create `docs/api-reference.md` — Complete API documentation including:
   - Base URL configuration
   - Authentication (API key header)
   - All endpoint routes, methods, request/response schemas
   - Error codes reference
   - Rate limiting details
   - Example `curl` commands for each endpoint
   - Postman collection export (optional but recommended)
2. Create `docs/integration-guide.md` — Step-by-step guide for CRM/ERP team:
   - How to obtain API credentials
   - How to test on staging
   - Webhook setup (if applicable)
   - Field mappings for CRM import

---

### 6A.5 — Implement error logging for failed submissions (no lead loss)

| | |
|---|---|
| **Expected** | Yes — no lead loss |
| **Status** | ⚠️ PARTIAL |

#### What EXISTS
- **Global error capture**: [`error-capture.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/lib/error-capture.ts) — captures `unhandledrejection` and `error` events (but only for SSR crash recovery, not form submissions)
- **Console logging only**: [`WorkRegistrationForm.tsx`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/components/registration/WorkingRegistrationForm.tsx#L211) does `console.error()` on failed uploads/inserts — **this is NOT persistent logging**
- **No `failed_submissions` table** in database
- **No retry mechanism** for failed submissions
- **No alerting** (email/Slack) on failed submissions

#### What NEEDS to be done

> [!CAUTION]
> This is the most critical item for "no lead loss". If a form submission fails and we only `console.error()`, that lead is gone forever.

**Action Items:**
1. **Create `failed_submissions` table** in Supabase:
   ```sql
   CREATE TABLE failed_submissions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     endpoint TEXT NOT NULL,
     payload JSONB NOT NULL,
     error_message TEXT,
     error_code TEXT,
     ip_address TEXT,
     user_agent TEXT,
     retry_count INT DEFAULT 0,
     resolved BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT now(),
     resolved_at TIMESTAMPTZ
   );
   ```
2. **Create server-side error logger** (`src/lib/submission-logger.server.ts`):
   - On any API endpoint failure, log the full payload + error to `failed_submissions`
   - Ensures zero lead loss even on DB insert failures
3. **Add admin page** to view/retry failed submissions: `src/routes/admin/failed-submissions.tsx`
4. **(Optional)** Add webhook/email notification on failure for immediate awareness

---

### 6A.6 — Provide a test/staging environment for tech team to test API before go-live

| | |
|---|---|
| **Expected** | Yes |
| **Status** | ⚠️ PARTIAL |

#### What EXISTS
- **Local dev server** running (`npm run dev` — currently active)
- **Supabase project** connected (env vars configured in [`.env`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/.env))
- **Cloudflare Workers** deployment target ([`.wrangler`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/.wrangler) directory exists)
- No dedicated staging environment/URL

#### What NEEDS to be done

**Action Items:**
1. **Deploy a staging branch** on Lovable / Cloudflare Workers with a separate Supabase project (or same project with a `staging_` table prefix/separate schema)
2. **Share staging URL** with CRM/ERP integration team (e.g., `https://staging.slvdevelopers.in`)
3. **Create staging API keys** separate from production
4. **Document the staging setup** in `docs/staging-environment.md`:
   - Staging URL
   - How to get staging API keys
   - Data reset schedule (if any)
   - Differences from production

---

### 6A.7 — Ensure API security (authentication, rate limiting)

| | |
|---|---|
| **Expected** | Yes — API key / token based |
| **Status** | ⚠️ PARTIAL |

#### What EXISTS
- **Supabase Auth (JWT)**: [`auth-middleware.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/integrations/supabase/auth-middleware.ts) — verifies Bearer JWT for admin routes ✅
- **Service Role Key**: [`client.server.ts`](file:///c:/Users/DELL/Downloads/SLV_U/slv-dev/src/integrations/supabase/client.server.ts) — server-side admin client with RLS bypass ✅
- **RLS policies** on Supabase tables (assumed based on RLS error handling in code) ✅
- **No API key authentication** for external CRM/ERP consumers ❌
- **No rate limiting** on any endpoint ❌
- **No CORS configuration** for API routes ❌

#### What NEEDS to be done

**Action Items:**

##### A) API Key Authentication for External Consumers
1. **Create `api_keys` table** in Supabase:
   ```sql
   CREATE TABLE api_keys (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     key_hash TEXT NOT NULL UNIQUE,    -- SHA-256 hash of the key
     name TEXT NOT NULL,               -- "SalesForce CRM", "ERP System"
     is_active BOOLEAN DEFAULT TRUE,
     permissions JSONB DEFAULT '["leads:write"]',
     created_at TIMESTAMPTZ DEFAULT now(),
     last_used_at TIMESTAMPTZ,
     expires_at TIMESTAMPTZ
   );
   ```
2. **Create API key middleware** (`src/lib/api-key-middleware.ts`):
   - Check for `X-API-Key` header
   - Hash the key and match against `api_keys` table
   - Return 401 if invalid/expired
   - Update `last_used_at` on valid use
3. **Create admin UI** to generate/revoke API keys

##### B) Rate Limiting
4. **Implement rate limiter** (`src/lib/rate-limiter.ts`):
   - Use Cloudflare Workers KV or in-memory store (per API key)
   - Default: **60 requests/minute** per API key
   - Return `429 Too Many Requests` with `Retry-After` header
5. **Apply to all `/api/*` routes**

##### C) CORS
6. **Add CORS headers** to API routes for cross-origin CRM/ERP access:
   - `Access-Control-Allow-Origin` (configurable allow-list)
   - `Access-Control-Allow-Headers: X-API-Key, Content-Type`
   - `Access-Control-Allow-Methods: POST, OPTIONS`

---

## Summary Matrix

| # | Requirement | Status | Priority | Effort |
|---|---|---|---|---|
| 6A.1 | Custom API endpoints per form | ⚠️ PARTIAL — Forms exist but use direct Supabase calls, no server API routes | 🔴 HIGH | ~3 days |
| 6A.2 | JSON REST response format | ⚠️ PARTIAL — No standard yet | 🟡 MEDIUM | ~0.5 day |
| 6A.3 | Dedicated endpoints (Contact, NRI, Site Visit, etc.) | ❌ NOT DONE — Only `/api/chat` exists | 🔴 HIGH | Included in 6A.1 |
| 6A.4 | API documentation | ❌ NOT DONE — No docs | 🟡 MEDIUM | ~1-2 days |
| 6A.5 | Error logging (no lead loss) | ⚠️ PARTIAL — Console only, no persistent logging | 🔴 HIGH | ~1-2 days |
| 6A.6 | Test/staging environment | ⚠️ PARTIAL — Local dev only, no shared staging | 🟡 MEDIUM | ~1 day |
| 6A.7 | API security (auth + rate limit) | ⚠️ PARTIAL — JWT auth exists for admin, no API key or rate limiting | 🔴 HIGH | ~2-3 days |

---

## Proposed Implementation Order

```
Phase 1 — Foundation (Days 1-2)
├── Create api-response.ts helper (6A.2)
├── Create api-key-middleware.ts (6A.7A)
├── Create rate-limiter.ts (6A.7B)
├── Create submission-logger.server.ts (6A.5)
└── Add failed_submissions + api_keys tables (Supabase migration)

Phase 2 — Endpoints (Days 3-4)
├── POST /api/leads/contact
├── POST /api/leads/nri (+ add "nri" to lead_source enum)
├── POST /api/leads/site-visit
├── POST /api/leads/career
├── POST /api/leads/brochure
├── POST /api/leads/project-enquiry
├── POST /api/registrations/vendor
├── POST /api/registrations/contractor
└── POST /api/registrations/architect

Phase 3 — Frontend Refactor (Day 5)
├── Update contact.tsx → call /api/leads/contact
├── Update careers.tsx → call /api/leads/career
├── Update WorkRegistrationForm → call /api/registrations/*
└── Create NRI + Site Visit booking pages (if needed)

Phase 4 — Documentation & Staging (Days 6-7)
├── Write docs/api-reference.md (6A.4)
├── Write docs/integration-guide.md (6A.4)
├── Deploy staging environment (6A.6)
├── Admin page: API key management (6A.7)
└── Admin page: Failed submissions viewer (6A.5)
```

---

## Open Questions

> [!IMPORTANT]
> 1. **NRI Form** — The requirements mention "NRI" as a separate form. Do we need a dedicated NRI enquiry page on the frontend, or is it only an API endpoint for CRM push?
> 2. **Site Visit Booking** — The `lead_source` enum already has `"site_visit"` but there's no booking form. Do we need a dedicated site visit booking page with date/time picker?
> 3. **CRM System** — Which CRM/ERP will be consuming these APIs? (Salesforce, Zoho, custom?) This affects CORS origins and webhook format.
> 4. **Webhook vs Pull** — Should the API also push data to the CRM via webhooks on new submissions, or will the CRM team pull from our endpoints?
> 5. **Staging Supabase** — Should we use a separate Supabase project for staging, or a separate schema within the same project?

---

> **Estimated Total Effort**: ~7-10 working days for complete implementation across all 7 items.
