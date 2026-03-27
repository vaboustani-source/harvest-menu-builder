

## Plan: Show Included Limits Summary Per Section Tab

### Problem
While building their menu, couples only see the "X / Y included" counter at the group label level. There's no upfront summary of what's included for the entire section/service phase, so they have to scroll through each category to understand their allowance.

### What we'll add

**Section-level "What's Included" summary bar** — directly below each section header (after the description, before the item groups), display a compact summary showing all group limits for that section:

```text
┌─────────────────────────────────────────────────┐
│  INCLUDED WITH YOUR PACKAGE                     │
│  Appetizers: 3  ·  Entrées: 2  ·  Sides: 2     │
│  Extras noted with pricing below                │
└─────────────────────────────────────────────────┘
```

- Each group label with a limit is listed with its included count and current selection count (e.g., "Appetizers: 1 of 3 selected")
- Groups where all included slots are filled get a checkmark
- Groups that exceed included count show an "extras" indicator
- Only shown when the section has at least one group with a configured limit

### File to modify
- `src/pages/CoupleMenuBuilder.tsx` — Add a summary block between lines 172-173 (after the section header divider, before the grouped items loop). Filter `groupLimits` for the current section and render a compact card.

