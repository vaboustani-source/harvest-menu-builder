import { useState } from 'react';
import { BuilderSelections, cocktailHourItems } from '@/data/builderMenuData';
import { Check } from 'lucide-react';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { BuilderFilterBar, matchesFilters, ItemBadges, type DietFilter, type SeasonFilter } from './BuilderFilterBar';
import { StepNotes } from './StepNotes';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepCocktailHour({ selections, onChange }: Props) {
  const selected = selections.cocktailHour;
  const { data: pricingItems } = usePricingConfig();
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');

  const includedCountRow = pricingItems?.find(p => p.item_key === 'cocktail_included_count');
  const baseValueRow = pricingItems?.find(p => p.item_key === 'cocktail_base_value');
  const includedCount = includedCountRow?.included_count ?? 4;
  const baseValue = baseValueRow ? Number(baseValueRow.price) : 6;

  const getItemPrice = (itemId: string): number => {
    const row = pricingItems?.find(p => p.category === 'cocktail' && p.item_key === itemId);
    if (row) return Number(row.price);
    const staticItem = cocktailHourItems.find(i => i.id === itemId);
    return staticItem?.price ?? 0;
  };

  const toggle = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id];
    onChange({ cocktailHour: updated });
  };

  const extras = Math.max(0, selected.length - includedCount);

  // Cocktail items don't have season data, so treat empty as year-round
  const visibleItems = cocktailHourItems.filter(item =>
    matchesFilters(item.diet, undefined, dietFilter, seasonFilter)
  );

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Cocktail Hour</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>The First Pour</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          One hour. {includedCount} selections. Every bite passed by Gilbertsville staff.
        </p>
      </div>

      <BuilderFilterBar dietFilter={dietFilter} seasonFilter={seasonFilter}
        onDietChange={setDietFilter} onSeasonChange={setSeasonFilter} />

      {/* Counter */}
      <div className="rounded-xl border px-5 py-3.5 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(122,158,126,0.04)', borderColor: 'rgba(122,158,126,0.3)' }}>
        <p className="font-sans text-[11px]" style={{ color: '#2C3E2D' }}>
          {selected.length <= includedCount ? (
            <><span className="font-semibold">{selected.length}</span> of {includedCount} included selections made</>
          ) : (
            <><span className="font-semibold">{includedCount}</span> of {includedCount} included · {extras} additional at full price</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleItems.map(item => {
          const isSelected = selected.includes(item.id);
          const selectionIndex = isSelected ? selected.indexOf(item.id) : -1;
          const isWithinIncluded = isSelected && selectionIndex < includedCount;
          const isExtra = isSelected && selectionIndex >= includedCount;
          const itemPrice = getItemPrice(item.id);
          const premium = Math.max(0, itemPrice - baseValue);
          const hasPremium = premium > 0;

          return (
            <button key={item.id} onClick={() => toggle(item.id)}
              className="text-left rounded-xl p-4 border-2 transition-all relative"
              style={{
                background: '#FFFFFF',
                borderColor: isSelected ? '#2C3E2D' : '#E8E2D9',
              }}>
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#C9A84C' }}>
                  <Check size={10} color="#FFFFFF" />
                </span>
              )}

              <p className="font-serif text-[13.5px] pr-8 leading-snug" style={{ color: '#1A1A1A' }}>{item.name}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="font-sans text-[9px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded"
                  style={{ background: '#F0EDE8', color: '#6B6B6B' }}>
                  {item.type}
                </span>
              </div>

              {/* Diet & Season badges */}
              <ItemBadges diet={item.diet} season={undefined} />

              {/* Price display */}
              <div className="mt-2">
                <p className="font-sans text-[11px]" style={{ color: '#6B6B6B' }}>
                  ${itemPrice}pp
                </p>
                {hasPremium && (
                  <p className="font-sans text-[10px] font-medium" style={{ color: '#C9A84C' }}>
                    +${premium}pp premium
                  </p>
                )}
              </div>

              {/* Selection status */}
              {isSelected && (
                <p className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase mt-1.5"
                  style={{ color: isExtra ? '#C9A84C' : '#7A9E7E' }}>
                  {isWithinIncluded
                    ? hasPremium ? `INCLUDED +$${premium}pp premium` : 'INCLUDED'
                    : `+$${itemPrice}pp`
                  }
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
