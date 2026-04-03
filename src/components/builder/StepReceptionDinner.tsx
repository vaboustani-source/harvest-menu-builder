import { useState } from 'react';
import { BuilderSelections, receptionCategories, type ReceptionItem } from '@/data/builderMenuData';
import { Check, Diamond } from 'lucide-react';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { BuilderFilterBar, matchesFilters, ItemBadges, type DietFilter, type SeasonFilter } from './BuilderFilterBar';
import { StepNotes } from './StepNotes';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

const catKeyMap: Record<string, keyof BuilderSelections['reception']> = {
  'salads': 'salads',
  'pastas-grains': 'pastasGrains',
  'proteins': 'proteins',
  'vegetables-starches': 'vegetablesStarches',
};

const catPricingKeys: Record<string, { included: string; extra: string }> = {
  'salads': { included: 'salads_included', extra: 'salads_extra_pp' },
  'pastas-grains': { included: 'pastas_included', extra: 'pastas_extra_pp' },
  'proteins': { included: 'proteins_included', extra: 'proteins_extra_pp' },
  'vegetables-starches': { included: 'sides_included', extra: 'sides_extra_pp' },
};

export function StepReceptionDinner({ selections, onChange }: Props) {
  const sel = selections.reception;
  const { data: pricingItems } = usePricingConfig();
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');

  const getPricingVal = (key: string) => pricingItems?.find(p => p.item_key === key);
  const getItemPremium = (itemId: string): number => {
    const row = pricingItems?.find(p => p.category === 'reception-items' && p.item_key === itemId);
    if (row) return Number(row.price);
    for (const cat of receptionCategories) {
      const item = cat.items.find(i => i.id === itemId);
      if (item) return item.price;
    }
    return 0;
  };

  const toggle = (catId: string, itemId: string) => {
    const key = catKeyMap[catId];
    if (!key) return;
    const current = sel[key];
    const updated = current.includes(itemId)
      ? current.filter(x => x !== itemId)
      : [...current, itemId];
    onChange({ reception: { ...sel, [key]: updated } });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Reception Dinner</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>The Main Event</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Family style. Every platter passed. Every seat fed.
        </p>
      </div>

      <BuilderFilterBar dietFilter={dietFilter} seasonFilter={seasonFilter}
        onDietChange={setDietFilter} onSeasonChange={setSeasonFilter} />

      {/* Base package summary */}
      <div className="rounded-xl border p-5 mb-8" style={{ background: 'rgba(122,158,126,0.04)', borderColor: 'rgba(122,158,126,0.3)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Diamond size={12} style={{ color: '#7A9E7E' }} />
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>
            Base Package — ${getPricingVal('base_reception_pp')?.price ?? 105}pp
          </p>
        </div>
        <ul className="space-y-1">
          {[
            'Artisan bread service',
            `${getPricingVal('salads_included')?.included_count ?? 1} farm salad — choose from Salads below`,
            `${getPricingVal('pastas_included')?.included_count ?? 1} pasta or grain — choose from Pastas & Grains below`,
            `${getPricingVal('proteins_included')?.included_count ?? 2} protein entrées — choose from Poultry, Meats, or Fish below`,
            `${getPricingVal('sides_included')?.included_count ?? 2} vegetables or starches — choose from Vegetables & Starches below`,
            'All family-style platters, service & staffing',
          ].map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: '#7A9E7E' }} />
              <span className="font-serif text-[12px]" style={{ color: '#1A1A1A' }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      {receptionCategories.map(cat => {
        const key = catKeyMap[cat.id];
        const selected = sel[key] || [];
        const pKeys = catPricingKeys[cat.id];
        const includedCount = getPricingVal(pKeys.included)?.included_count ?? cat.included;
        const extraCharge = pKeys ? Number(getPricingVal(pKeys.extra)?.price ?? cat.extraPrice) : cat.extraPrice;
        const extras = Math.max(0, selected.length - includedCount);

        // Filter items but group by subcategory
        const filteredItems = cat.items.filter(item =>
          matchesFilters(item.diet, item.season, dietFilter, seasonFilter)
        );
        const grouped = groupBySubcategory(filteredItems);

        return (
          <div key={cat.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>{cat.label}</p>
              <span className="font-sans text-[10px]" style={{
                color: selected.length > includedCount ? '#C9A84C' : '#6B6B6B',
              }}>
                {selected.length <= includedCount
                  ? `${selected.length} of ${includedCount} included`
                  : `${includedCount} of ${includedCount} included · ${extras} additional`
                }
              </span>
            </div>

            {grouped.map(({ subcategory, items }) => (
              <div key={subcategory || 'main'}>
                {subcategory && (
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase mb-2 mt-4" style={{ color: '#C9A84C' }}>
                    {subcategory}
                  </p>
                )}
                <div className="space-y-2 mb-3">
                  {items.map(item => {
                    const isSelected = selected.includes(item.id);
                    const selIdx = selected.indexOf(item.id);
                    const isWithinIncluded = isSelected && selIdx < includedCount;
                    const isExtra = isSelected && selIdx >= includedCount;
                    const premium = getItemPremium(item.id);
                    const hasPremium = premium > 0;

                    let chargeLabel = '';
                    if (isWithinIncluded) {
                      chargeLabel = hasPremium ? `INCLUDED +$${premium}pp premium` : 'INCLUDED';
                    } else if (isExtra) {
                      const totalCharge = extraCharge + premium;
                      chargeLabel = hasPremium ? `+$${totalCharge}pp` : `+$${extraCharge}pp`;
                    }

                    return (
                      <button key={item.id} onClick={() => toggle(cat.id, item.id)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
                        style={{
                          background: '#FFFFFF',
                          borderColor: isSelected ? '#2C3E2D' : '#E8E2D9',
                        }}>
                        <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{
                            borderColor: isSelected ? '#2C3E2D' : '#E8E2D9',
                            background: isSelected ? '#2C3E2D' : 'transparent',
                          }}>
                          {isSelected && <Check size={10} color="#FFFFFF" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{item.name}</p>
                          {/* Diet & Season badges */}
                          <ItemBadges diet={item.diet} season={item.season} />
                          {/* Premium indicator — always shown for premium items */}
                          {hasPremium && !isSelected && (
                            <p className="font-sans text-[10px] font-medium mt-1" style={{ color: '#C9A84C' }}>
                              +${premium}pp premium
                            </p>
                          )}
                          {/* Extra breakdown */}
                          {isExtra && hasPremium && (
                            <p className="font-sans text-[9px] mt-0.5" style={{ color: '#6B6B6B' }}>
                              (${extraCharge}pp additional + ${premium}pp premium)
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {isSelected ? (
                            <span className="font-sans text-[10px] font-semibold tracking-[0.05em] uppercase"
                              style={{ color: isExtra ? '#C9A84C' : hasPremium ? '#C9A84C' : '#7A9E7E' }}>
                              {chargeLabel}
                            </span>
                          ) : hasPremium ? (
                            <span className="font-sans text-[11px] font-medium" style={{ color: '#C9A84C' }}>
                              +${premium}pp
                            </span>
                          ) : (
                            <span className="font-sans text-[11px]" style={{ color: '#6B6B6B' }}>—</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <StepNotes stepLabel="Reception Dinner" value={selections.stepNotes.receptionDinner}
        onChange={v => onChange({ stepNotes: { ...selections.stepNotes, receptionDinner: v } })} />
    </div>
  );
}

function groupBySubcategory(items: ReceptionItem[]) {
  const groups: { subcategory: string | undefined; items: ReceptionItem[] }[] = [];
  for (const item of items) {
    const existing = groups.find(g => g.subcategory === item.subcategory);
    if (existing) existing.items.push(item);
    else groups.push({ subcategory: item.subcategory, items: [item] });
  }
  return groups;
}
