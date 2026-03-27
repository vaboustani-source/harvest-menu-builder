

## Plan: Admin Couple Submissions Review

### What exists now
The admin "Couples" view lists each couple's basic info (names, email, wedding date, guest count, status) with only a delete action. There is no way to see what menu items a couple has selected.

### What we'll build

**1. Expandable selection viewer per couple card**
- Add a "View Selections" button on each couple card that expands an inline panel showing all their menu selections
- Selections grouped by section and sub-group, matching the menu structure
- Each selected item shows its name, section, group, and whether it's within the included count or an "extra"
- Uses the existing `couple_selections` table joined with `menu_items` data

**2. Selection summary stats on the couple card**
- Show a count badge (e.g., "12 items selected") on each couple row so the director can see at a glance who has submitted and who hasn't

**3. PDF export per couple** (already partially referenced in memory)
- Add an "Export PDF" button per couple that generates a formatted summary of their selections organized by section/group, with extras clearly marked

### Technical approach

- **New hook**: `useCoupleSelections` already exists for the couple's own view. We'll reuse it in admin context by passing each couple's ID
- **Admin couple card expansion**: Add a collapsible section within each couple card in `AdminDashboard.tsx` (lines 339-375). On expand, fetch that couple's selections and cross-reference with the `menu_items` and `menu_sections` data already loaded
- **Grouping logic**: Reuse the section/group structure from `useMenuData` to display selections organized by category, with included vs. extra counts from `section_group_limits`
- **PDF generation**: Use a lightweight library (e.g., `jspdf` or browser print-to-PDF) to render a clean summary

### Files to modify
- `src/pages/AdminDashboard.tsx` — Add expandable selections panel to each couple card, selection count badge, and export button
- `src/hooks/useCoupleSelections.ts` — May need a variant that fetches all couples' selection counts in one query for the summary badges

### UI details
- Expand/collapse toggle with a chevron icon on the couple card
- Selections displayed as a clean list grouped by section → group label
- Items beyond the included limit shown under an "Extras" divider (matching the couple-facing pattern)
- "No selections yet" empty state for couples who haven't started
- Export button styled with the existing admin button pattern (`border border-primary bg-primary-foreground text-primary`)

