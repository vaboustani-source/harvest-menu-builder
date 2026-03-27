

## Plan: Auto-Calculated Pricing in Admin PDF Export

### What we need

The app needs to know two pricing values per section to auto-calculate totals:
1. **Base price per person** for each section (e.g., Rehearsal Dinner $65pp, Reception $95pp)
2. **Fixed price per extra item** per group (already partially stored as `extra_price_note` in `section_group_limits`, but as free text — needs to become a numeric value)

### Database changes

**1. Add `base_price_pp` column to `menu_sections`**
- New nullable integer column storing cents or a text field like `"65"` (dollars) for the base per-person price of that service phase
- Admin sets this per section

**2. Add `extra_price_pp` numeric column to `section_group_limits`**
- Stores the actual numeric extra price per item (e.g., `8` for $8pp) alongside the existing display-only `extra_price_note`
- Used for calculation; `extra_price_note` remains for display text

### Admin UI changes — `AdminDashboard.tsx`

**3. Section base price editor**
- Add a price input field on each section in the admin menu editor so the admin can set the per-person base price for each service phase

**4. Group limit modal update — `GroupLimitModal.tsx`**
- Add a numeric "Extra Item Price (per person)" input alongside the existing "Extra Item Price Note" text field
- This stores the calculable value in `extra_price_pp`

### Pricing calculation & PDF — `CoupleSelectionsViewer.tsx`

**5. Auto-calculate pricing per couple**
- For each section: start with `base_price_pp`
- For each group within the section: count extras beyond `included_count`, multiply by `extra_price_pp`
- Sum section base + all extras = section total per person
- Sum all sections = grand total per person
- Optionally multiply by guest count for event total

**6. Updated PDF export with itemized breakdown**
- Per section: show base price, then list each group's extras with unit price and subtotal
- Section subtotal line
- Grand total per person at the bottom
- Event total (× guest count) if guest count is available

### Files to modify
- **Migration**: Add `base_price_pp` to `menu_sections`, `extra_price_pp` to `section_group_limits`
- `src/pages/AdminDashboard.tsx` — Section base price input in menu editor
- `src/components/admin/GroupLimitModal.tsx` — Add numeric extra price field
- `src/components/admin/CoupleSelectionsViewer.tsx` — Pricing calculation logic + updated PDF template
- `src/hooks/useMenuData.ts` — Update type to include `base_price_pp`
- `src/hooks/useGroupLimits.ts` — Update type to include `extra_price_pp`

