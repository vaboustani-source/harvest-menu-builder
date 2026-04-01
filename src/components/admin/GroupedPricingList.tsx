import { type PricingConfigRow } from '@/hooks/usePricingConfig';
import { PricingRow } from './PricingRow';

interface GroupedPricingListProps {
  items: PricingConfigRow[];
  showIncludedCount?: boolean;
  showActiveToggle?: boolean;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onUpdateIncludedCount: (id: string, count: number) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

/**
 * Renders pricing rows grouped by `display_category`.
 * Items without a display_category render ungrouped at the top.
 * Each group gets a quiet uppercase divider label.
 */
export function GroupedPricingList({
  items, showIncludedCount, showActiveToggle, onUpdatePrice, onUpdateIncludedCount, onToggleActive, onDelete,
}: GroupedPricingListProps) {
  // Preserve sort_order, group by display_category
  const hasCategory = items.some(i => i.display_category);

  if (!hasCategory) {
    // No grouping needed — flat list
    return (
      <div className="divide-y divide-cream-dark">
        {items.map(item => (
          <PricingRow
            key={item.id}
            item={item}
            showIncludedCount={showIncludedCount}
            showActiveToggle={showActiveToggle}
            onUpdatePrice={onUpdatePrice}
            onUpdateIncludedCount={onUpdateIncludedCount}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  // Build ordered groups preserving first-appearance order
  const groupOrder: string[] = [];
  const groups: Record<string, PricingConfigRow[]> = {};
  const ungrouped: PricingConfigRow[] = [];

  for (const item of items) {
    const cat = item.display_category;
    if (!cat) {
      ungrouped.push(item);
      continue;
    }
    if (!groups[cat]) {
      groups[cat] = [];
      groupOrder.push(cat);
    }
    groups[cat].push(item);
  }

  return (
    <div>
      {/* Ungrouped items first */}
      {ungrouped.length > 0 && (
        <div className="divide-y divide-cream-dark">
          {ungrouped.map(item => (
            <PricingRow
              key={item.id}
              item={item}
              showIncludedCount={showIncludedCount}
              showActiveToggle={showActiveToggle}
              onUpdatePrice={onUpdatePrice}
              onUpdateIncludedCount={onUpdateIncludedCount}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Grouped items */}
      {groupOrder.map(cat => (
        <div key={cat}>
          <div className="px-5 pt-5 pb-2">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase font-semibold text-muted-foreground">
              {cat}
            </p>
          </div>
          <div className="divide-y divide-cream-dark">
            {groups[cat].map(item => (
              <PricingRow
                key={item.id}
                item={item}
                showIncludedCount={showIncludedCount}
                showActiveToggle={showActiveToggle}
                onUpdatePrice={onUpdatePrice}
                onUpdateIncludedCount={onUpdateIncludedCount}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
