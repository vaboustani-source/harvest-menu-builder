# Menu Builder ↔ Planning Hub — Integration Findings

Report only. No code or schema was changed.

## 1. What gets written when a couple makes menu selections

**Single table: `public.builder_selections`** (one row per couple, upserted on `couple_id`).

Columns written by the builder:
- `couple_id` (uuid) — FK to `public.couples.id`
- `selections` (jsonb) — the entire nested `BuilderSelections` object: `rehearsalDinner`, `welcomeHour`, `cocktailHour`, `reception { salads, pastasGrains, proteins, vegetablesStarches }`, `mealInclusions`, `desserts`, `barPackage { …, selectedAddOns }`, `stepNotes`
- `status` (text) — `not_started` → `in_progress` → `submitted`
- `submitted_at` (timestamptz, nullable) — only set on submit
- `updated_at` (timestamptz) — bumped on every write

When it writes (`src/hooks/useBuilderState.ts`):
- **Autosave**: 2 seconds (debounced) after any selection change. Calls `upsert({ couple_id, selections, status, updated_at }, { onConflict: 'couple_id' })`. If status was `not_started` it flips to `in_progress`.
- **Explicit save** (`saveSelections`): same upsert, cancels the pending debounce.
- **Submit** (`submitSelections`): same upsert plus `status='submitted'` and `submitted_at = now()`.

Side-effect writes (same flow, different tables):
- `public.change_history` — INSERT per changed step on every save: `{ couple_id, step, previous_value, new_value, post_submission }`. This is an append-only audit log.
- `public.menu_progress` and `public.couple_milestones` — submit auto-triggers milestones (`draft_submitted`, `first_revision_submitted`, `final_revision_submitted`) via `autoTriggerMilestone`.

**`public.couple_selections` is NOT written by the builder.** Despite the name, no insert/update/delete call to that table exists anywhere in `src/`. The hook `useCoupleSelections` only reads it. The table currently holds 19 rows (seed/legacy from an earlier per-item schema before the JSONB pivot). Treat it as dead/legacy storage. Live selection state lives entirely in `builder_selections.selections` JSONB.

## 2. Identity — and the Hub linkage gap

How a couple is identified when saving:
1. `supabase.auth.getUser()` returns the auth user.
2. App looks up `couples` by `couples.user_id = auth.users.id` and reads `couples.id` (a separate uuid).
3. Every write to `builder_selections`, `change_history`, `menu_progress`, `couple_milestones` keys on **`couple_id` = `couples.id`** — NOT the auth user id, NOT the email.

The `public.couples` table columns: `id, user_id, partner1_name, partner2_name, email, wedding_date, guest_count, status, created_at, updated_at`. There is **no `event_id`** column. RLS policies and joins are scoped by `user_id` / `couple_id` only.

**Hub linkage check** — searched the entire codebase, migrations, and `public` schema:
- No column named `event_id` exists on `couples`, `builder_selections`, `couple_selections`, or any other public table in this project.
- No table named `events` (or anything matching `%event%`) exists in this `public` schema. Only the basics-cards seed text mentions the word "events" in copy.
- No foreign key, view, or RPC reaches a Hub `events` table.

**Bottom line for integration:** today a saved menu can only be tied back to a Hub event by `couples.email` or by manually matching `wedding_date` + names. There is no structural join. To make selections "flow into the Hub and post to financials," you'll need to add an `event_id` (e.g. on `couples`, nullable uuid referencing the Hub's events table in the shared DB) and populate it when a couple record is created/linked.

## 3. Login — auth surface

`src/components/harvest/CoupleLoginModal.tsx`:
- Calls `supabase.auth.signInWithPassword({ email, password })` against the **same Supabase project** the Hub uses (this app uses the shared `@/integrations/supabase/client`).
- After auth succeeds, it requires a matching row in `public.couples` with the same email; otherwise it shows a "couple accounts only" error (admins log in elsewhere).
- Sign-ups are **disabled** per project memory; couple users are provisioned by an admin (admin creates the `auth.users` row and the linked `couples` row — see `CoupleFormModal`).
- The login is therefore **the same Supabase auth identity as the Hub** — same `auth.users.id` is available on both sides — provided the Hub also points at this Supabase project and the couple's auth user was created there. Today the join from a Hub event to a builder couple still has to happen via `auth.users.id` or email, because there is no `event_id` on `couples`.

There is also an unrelated "Basics Gate" password (`"Boustani6"`) for the public Basics tab — that's a UI gate only, not real auth, and is separate from couple login.

## 4. Submit / finalize / lock

Yes, but only at the data level — there is no enforcement.

- `builder_selections.status` is a text column with three observed values: `not_started`, `in_progress`, `submitted`.
- `submitSelections()` sets `status='submitted'` and stamps `submitted_at`. It also fires the next pending milestone (`draft_submitted`, `first_revision_submitted`, or `final_revision_submitted` depending on prior progress) — supporting multiple submission rounds.
- After submit, autosave keeps running and keeps writing — `change_history.post_submission` flips to `true` so post-submit edits are tracked, but the row is not frozen. There is no DB trigger, RLS policy, or app-level guard that prevents further mutation once `status='submitted'`.
- There is no `approved_at`, `locked_at`, `version`, or `revision_number` column. Revisions are implicit — the JSONB is overwritten in place; history lives only in `change_history` deltas.

For Hub financial posting you'll want an explicit lock (e.g. `status='approved'`, `approved_at`, `approved_total_cents`, possibly a snapshot row) and either a trigger or RLS policy that blocks UPDATE on `selections` once approved.

## 5. Pricing — totals are computed, never stored

- `src/data/builderMenuData.ts` exports `calculateTotal(selections, pricing)` which produces a `TotalBreakdown` (line items + grand total) at render time in the builder UI and in `CoupleSelectionsViewer` for admins.
- Inputs come from `pricing_config` (read via `usePricingConfig`): per-person base values (`base_reception_pp`, `extra_nonalc_pp`, `extra_spritzer_pp`, `salads_included`/`salads_extra_pp`, `pastas_included`/`pastas_extra_pp`, `proteins_*`, `sides_*`, etc.) plus per-item upcharges. A handful of fallback constants are hardcoded (e.g. base reception = $105, additional-hour bar = $18pp).
- Pricing source-of-truth is enforced as dynamic (project memory: "Prices strictly dynamic from `pricing_config`. Changes never retroactive for submitted menus.") — but **nothing in the database actually freezes prices on submit**. The "non-retroactive" rule is aspirational; today re-rendering a submitted menu with a new `pricing_config` would yield a new total.
- No column anywhere stores a computed total. Searched: `total`, `grand_total`, `total_amount`, `total_price`, `estimated_total` — none exist on `builder_selections`, `couples`, or any other public table. No edge function / RPC computes or persists a total either. Guest count for per-person math comes from `couples.guest_count`.

For Hub financials this means: (a) you'll need to compute the total at the moment of approval and store it (e.g. `builder_selections.approved_total_cents` plus a snapshot of the priced line items / pricing_config version used), and (b) any pricing edits made after approval must not change the posted financial amount.

---
Read-only investigation — no code, schema, or data was modified.
