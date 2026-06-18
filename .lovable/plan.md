# Current Backend Wiring — Read-Only Findings

No files were modified. This is purely a map of how the app is connected today, so you can choose the safest re-point method.

## 1. Backend connection

- **Type:** Lovable Cloud (Lovable-managed Supabase). Not an external self-managed project.
- **Project ref:** `ggreatfaqiawxjpqpixy` — confirmed in two places:
  - `supabase/config.toml` → `project_id = "ggreatfaqiawxjpqpixy"`
  - `.env` → `VITE_SUPABASE_PROJECT_ID=ggreatfaqiawxjpqpixy`, `VITE_SUPABASE_URL=https://ggreatfaqiawxjpqpixy.supabase.co`
- Edge functions present: `create-couple`, `create-admin` (deployed to this same project, use its `SUPABASE_SERVICE_ROLE_KEY`).

## 2. Client config (`src/integrations/supabase/client.ts`)

URL and key come from Vite env vars — no hardcoded literals:

```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

Env vars defined in `.env` (Lovable-managed, auto-generated):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- (also `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` for non-Vite contexts)

The file header says "automatically generated. Do not edit it directly" — on Lovable Cloud, these are rewritten on every sync to whatever Cloud project is attached. Editing `.env` or `client.ts` by hand is not the supported re-point path.

## 3. Couple authentication

- **Method:** Email + password only. No magic link, no OAuth, no anonymous. Sign-ups are disabled at the project level — couples cannot self-register.
- **Login UIs (two entry points, identical mechanism):**
  - `src/components/builder/CoupleLogin.tsx` (full page)
  - `src/components/harvest/CoupleLoginModal.tsx` (modal from public site)
  - Both call `supabase.auth.signInWithPassword({ email, password })`.
- **Account creation:** Admin-only, via edge function `supabase/functions/create-couple/index.ts`, invoked from `src/components/admin/CoupleFormModal.tsx` (`supabase.functions.invoke('create-couple', ...)`). The function uses the service role key to:
  1. `auth.admin.createUser({ email, password, email_confirm: true })`
  2. `insert` into `public.couples` with `user_id = authData.user.id`, `email`, `partner1_name`, `partner2_name`, optional `wedding_date`, `guest_count`.
  If the couples insert fails, it deletes the auth user (rollback).
- **Linking after login:** The couple is identified by `auth.uid()` mapped to `couples.user_id`. The canonical lookup is in `src/hooks/useBuilderState.ts`:

  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  const { data: couple } = await supabase
    .from('couples').select('*').eq('user_id', user.id).single();
  ```
  `useCoupleSelections.ts` (`useCoupleProfile`) does the same `eq('user_id', user.id)` lookup. `CoupleLoginModal` additionally guards by checking `couples.email == typed email` after sign-in to reject admin accounts.
- **No on-first-login row creation.** If a `couples` row does not already exist for the `auth.users` id, the builder will silently fail to load a profile.

## 4. Where the builder writes a couple's selections

The save target is the `builder_selections` table (singular row per couple, upserted on `couple_id`). The writes live entirely in `src/hooks/useBuilderState.ts`:

- **Auto-save (debounced 2s after any change):**
  ```ts
  supabase.from('builder_selections').upsert({
    couple_id: profile.id,      // = couples.id (NOT auth user id)
    selections: next,           // full JSONB blob
    status: statusToSave,       // 'in_progress' | 'submitted' | ...
    updated_at: new Date().toISOString(),
  }, { onConflict: 'couple_id' });
  ```
- **Explicit save** (`saveSelections`) and **submit** (`submitSelections`) do the same upsert; submit additionally sets `status: 'submitted'` and `submitted_at`, then calls `autoTriggerMilestone` which writes to `menu_progress`.
- **Change log:** every diff also inserts rows into `public.change_history` (`couple_id`, `step`, `previous_value`, `new_value`, `post_submission`).
- **No `event_id`** is set anywhere — the only key tying selections to a couple is `couple_id` (FK to `couples.id`, which itself FKs to `auth.users.id` via `user_id`).
- Other couple-keyed tables touched by the app: `menu_progress` (milestones) and `change_history` (audit). The admin dashboard also `update`s and `delete`s rows in `couples` directly.

## Implications for re-pointing (informational, no action taken)

- Because identity flows `auth.users.id` → `couples.user_id` → `couples.id` → `builder_selections.couple_id` / `change_history.couple_id` / `menu_progress.couple_id`, a re-point must preserve (or re-map) **auth user UUIDs** if you want existing couples to keep their saved selections. If only `couples.user_id` values change on the new backend, the existing `couples` rows will reattach automatically, but any cached `couple_id` in selections rows must match the new `couples.id`.
- The Lovable-managed `client.ts` and `.env` are regenerated by Cloud; the supported re-point is via the Cloud/Connectors UI rather than hand-editing those files. Edge functions (`create-couple`, `create-admin`) and `SUPABASE_SERVICE_ROLE_KEY` are tied to the current Cloud project and will need to be redeployed/reconfigured against the shared project.
- Sign-ups being disabled on the source project is a project-level setting on `ggreatfaqiawxjpqpixy` — verify the same is set on the shared target, otherwise the couple-only login guard in `CoupleLoginModal` becomes the only barrier.

No code, env, database, or config was changed.
