import { useState } from 'react';
import { BuilderSelections, rehearsalThemes } from '@/data/builderMenuData';
import { Check } from 'lucide-react';
import { StepNotes } from './StepNotes';
import { Textarea } from '@/components/ui/textarea';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { BuilderFilterBar, type DietFilter, type SeasonFilter } from './BuilderFilterBar';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

/** Parse season text from rehearsal themes to match filter */
function themeMatchesSeason(seasonText: string, filter: SeasonFilter): boolean {
  if (filter === 'all') return true;
  const lower = seasonText.toLowerCase();
  if (filter === 'year-round') return lower.includes('year-round');
  return lower.includes(filter);
}

function themeMatchesDiet(dietTags: string[], filter: DietFilter): boolean {
  if (filter === 'all') return true;
  return dietTags.includes(filter);
}

export function StepRehearsalDinner({ selections, onChange }: Props) {
  const sel = selections.rehearsalDinner;
  const { data: pricingItems } = usePricingConfig();
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');

  const getAddonPrice = (themeId: string): number | null => {
    const row = pricingItems?.find(p => p.category === 'rehearsal-addons' && p.item_key === `addon-${themeId}`);
    return row ? Number(row.price) : null;
  };

  const selectTheme = (id: string) => {
    const isDeselect = sel.themeId === id;
    onChange({
      rehearsalDinner: {
        ...sel,
        themeId: isDeselect ? null : id,
        addOnSelected: false,
      },
    });
  };

  const toggleAddOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ rehearsalDinner: { ...sel, addOnSelected: !sel.addOnSelected } });
  };

  const visibleThemes = rehearsalThemes.filter(theme =>
    themeMatchesDiet(theme.dietaryTags, dietFilter) &&
    themeMatchesSeason(theme.season, seasonFilter)
  );

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Rehearsal Dinner</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>Set the Tone</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Intimate, unhurried, and intentionally warm. The rehearsal dinner sets the tone for the weekend.
        </p>
      </div>

      <BuilderFilterBar dietFilter={dietFilter} seasonFilter={seasonFilter}
        onDietChange={setDietFilter} onSeasonChange={setSeasonFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleThemes.map(theme => {
          const isSelected = sel.themeId === theme.id;
          const addonPrice = getAddonPrice(theme.id);
          const hasAddon = !!theme.addOn;
          const addonActive = isSelected && sel.addOnSelected && hasAddon;

          return (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className="text-left rounded-xl p-5 transition-all duration-200 relative border-2"
              style={{
                background: '#FFFFFF',
                borderColor: isSelected ? '#2C3E2D' : '#E8E2D9',
                boxShadow: isSelected ? '0 2px 20px rgba(44,62,45,0.08)' : 'none',
              }}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#C9A84C' }}>
                  <Check size={14} color="#FFFFFF" />
                </span>
              )}

              <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#2C3E2D' }}>
                {theme.name}
              </p>
              <p className="font-sans text-[10px] italic mb-2" style={{ color: '#C9A84C' }}>{theme.season}</p>

              {/* Diet & Season badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {theme.dietaryTags.map(tag => {
                  const colors: Record<string, string> = {
                    'VG': '#5a9456', 'VE': '#7a5a9e', 'GF': '#9E6B3C', 'DF': '#3C6B9E',
                  };
                  const c = colors[tag] || '#6B6B6B';
                  return (
                    <span key={tag} className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
                      style={{ color: c, borderColor: c }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              <ul className="space-y-1 mb-4">
                {theme.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: '#2C3E2D' }} />
                    <span className="font-serif text-[12.5px] leading-relaxed" style={{ color: '#1A1A1A' }}>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Inline add-on toggle */}
              {hasAddon && (
                <div
                  className="pt-3 mt-1 border-t"
                  style={{
                    borderColor: '#E8E2D9',
                    background: addonActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                    borderRadius: addonActive ? '6px' : undefined,
                    margin: addonActive ? '-2px -4px -4px -4px' : undefined,
                    padding: addonActive ? '12px 10px 10px 10px' : undefined,
                  }}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={isSelected ? toggleAddOn : undefined}
                    role="checkbox"
                    aria-checked={addonActive}
                  >
                    <span
                      className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        borderColor: addonActive ? '#C9A84C' : isSelected ? '#C9A84C80' : '#E8E2D9',
                        background: addonActive ? '#C9A84C' : 'transparent',
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    >
                      {addonActive && <Check size={10} color="#FFFFFF" />}
                    </span>
                    <span className="font-serif italic text-[12px] flex-1" style={{ color: '#C9A84C' }}>
                      {theme.addOn!.name}
                    </span>
                    <span className="font-sans text-[11px] font-medium whitespace-nowrap" style={{ color: '#C9A84C' }}>
                      +${addonPrice ?? theme.addOn!.price}pp
                    </span>
                  </div>
                </div>
              )}

              <p className="font-serif text-xl font-light mt-3" style={{ color: '#2C3E2D' }}>
                ${theme.price}<span className="text-sm">pp</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom theme note */}
      <div className="mt-8 rounded-xl p-5 border" style={{ background: '#FBF9F5', borderColor: '#C9A84C40' }}>
        <p className="font-serif italic text-[13px] mb-3" style={{ color: '#6B6B6B' }}>
          Have a theme in mind that isn't listed? Note it here and your coordinator will follow up.
        </p>
        <Textarea
          value={sel.customThemeNote}
          onChange={e => onChange({ rehearsalDinner: { ...sel, customThemeNote: e.target.value } })}
          placeholder="Tell us about your vision…"
          className="border-[#E8E2D9] bg-white font-serif text-sm min-h-[80px] resize-none"
        />
      </div>

      <StepNotes stepLabel="Rehearsal Dinner" value={selections.stepNotes.rehearsalDinner}
        onChange={v => onChange({ stepNotes: { ...selections.stepNotes, rehearsalDinner: v } })} />
    </div>
  );
}
