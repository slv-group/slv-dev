# Diagnosis: Vercel "This page didn't load" on `/csr`

## 1. Quick Summary of What Went Wrong

The error screen displayed at **`slv-dev-olive.vercel.app/csr`**:

```text
This page didn't load
Something went wrong on our end. You can try refreshing or head back home.
[Try again]  [Go home]
```

is rendered by the application's global error handler (`src/lib/error-page.ts` and `src/routes/__root.tsx`).

There are **two exact root causes** responsible for this failure on Vercel:

---

### Root Cause 1: Unmerged Bugfix Commit (The Crash on `/csr`)

In commit `f9c8407` ("_refactor(csr): remove static sample initiatives and fetch purely from supabase_") which was merged to `main` via PR #2:

- The code removed static sample initiatives and switched to Supabase.
- However, the JSX in `src/routes/csr.tsx` still referenced `featured.image`, `featured.title`, `featured.category`, `featured.description`, etc.
- When `dbInitiatives` is loading or empty, `featured` is `undefined`. Accessing properties like `featured.image` throws a fatal JavaScript error:
  ```text
  TypeError: Cannot read properties of undefined (reading 'image')
  ```
- **The fix was created in commit `2636bbd`** (`fix(csr): safely guard featured initiative and resolve missing reference`), but **that fix is only on `feat/csr-updates` and has NOT been merged to `slv-group/main`**.
- Because Vercel deploys from `main`, **Vercel is still running the broken commit (`a2fc27a` / `f9c8407`)**.

---

### Root Cause 2: Missing Supabase Environment Variables on Vercel

In `src/integrations/supabase/client.ts`, the client checks:

```ts
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing Supabase environment variable(s)...");
}
```

- Your `.env` file on your local machine contains:
  ```env
  VITE_SUPABASE_URL="https://zjvnxolsmfkurrwissru.supabase.co"
  VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_8uNNBlg_ej5skG5wpPsbeA_7uMCtqiH"
  SUPABASE_URL="https://zjvnxolsmfkurrwissru.supabase.co"
  SUPABASE_PUBLISHABLE_KEY="sb_publishable_8uNNBlg_ej5skG5wpPsbeA_7uMCtqiH"
  ```
- Because `.env` is ignored by Git (`.gitignore`), Vercel does **not** have access to these values unless they are explicitly entered into Vercel's Environment Variables dashboard.
- Without these keys on Vercel, the Supabase client throws an uncaught error upon initialization, triggering the exact same error screen.

---

## 2. Step-by-Step Fix

### Step 1: Add Environment Variables in Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com).
2. Select your project (`slv-dev` or `slv-dev-olive`).
3. Navigate to **Settings** &rarr; **Environment Variables**.
4. Add the following keys (select **Production**, **Preview**, and **Development** environments):

| Key                             | Value                                            |
| :------------------------------ | :----------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://zjvnxolsmfkurrwissru.supabase.co`       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_8uNNBlg_ej5skG5wpPsbeA_7uMCtqiH` |
| `SUPABASE_URL`                  | `https://zjvnxolsmfkurrwissru.supabase.co`       |
| `SUPABASE_PUBLISHABLE_KEY`      | `sb_publishable_8uNNBlg_ej5skG5wpPsbeA_7uMCtqiH` |

5. Click **Save**.

---

### Step 2: Merge the Bugfix to `main` and Trigger Vercel Deploy

Commit `2636bbd` contains the required safety check (`{featured && (...)`) and definition. It is already committed on `feat/csr-updates`.

Merge `feat/csr-updates` into `main` and push to remote:

```bash
# Checkout main and pull latest
git checkout main
git pull slv-group main

# Merge the fix
git merge feat/csr-updates

# Push to trigger Vercel deployment
git push slv-group main
```

_(Or open a Pull Request from `feat/csr-updates` into `main` on GitHub and click "Merge Pull Request")._

---

### Step 3: Verify the Deployment

Once Vercel completes the build and deployment:

1. Open `https://slv-dev-olive.vercel.app/csr`.
2. Hard-refresh (`Ctrl + F5` or `Cmd + Shift + R`).
3. The page will load all CSR initiatives from Supabase smoothly without crashing.
