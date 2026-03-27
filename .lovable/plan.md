

## Plan: Curated Back-of-House Selection Review

### Problem
The current selections viewer displays items in a flat list grouped only by section title and group label. For back-of-house use, the admin needs clear visual segmentation by event phase (Rehearsal Dinner, Cocktail Hour, Reception, etc.) with each phase's categories clearly nested underneath.

### Changes — `src/components/admin/CoupleSelectionsViewer.tsx`

**1. Bold section headers with visual separators**
- Each section (Rehearsal Dinner, Cocktail Hour, Reception, Desserts, etc.) gets a prominent header with a full-width divider line above it, the section emoji, and the section title in a larger, bolder style
- Sections that have no selections are omitted entirely

**2. Category sub-groups indented under each section**
- Within each section, group labels (e.g., "Appetizers", "Entrées", "Sides") displayed as distinct sub-headers with a left border accent
- Items listed underneath each category with bullet-style markers
- Included vs. extra distinction preserved with the dashed divider

**3. Section count chips**
- Each section header shows a small count badge (e.g., "5 items") so the director can scan quantities at a glance

**4. Updated PDF export**
- Match the same curated structure: clear section breaks with horizontal rules, category sub-headers, and item counts per section

### UI structure
```text
─────────────────────────────────
🍽 REHEARSAL DINNER          3 items
─────────────────────────────────
  APPETIZERS
    · Bruschetta
    · Caprese Skewers
  ENTRÉES
    · Grilled Salmon

─────────────────────────────────
🥂 COCKTAIL HOUR             4 items
─────────────────────────────────
  PASSED HORS D'OEUVRES
    · Shrimp Toast
    · Mini Crab Cakes
    ─ 2 included · 1 extra ($5pp) ─
    · Wagyu Sliders

─────────────────────────────────
🍷 RECEPTION                 8 items
─────────────────────────────────
  SALADS
    · Caesar Salad
  ENTRÉES
    · Filet Mignon
    · Pan-Seared Halibut
  SIDES
    · Roasted Vegetables
    ...
```

### Files to modify
- `src/components/admin/CoupleSelectionsViewer.tsx` — Restyle the grouped display with prominent section dividers, category sub-headers with left border accent, per-section item counts, and updated PDF template

