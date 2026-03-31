import { BuilderSelections, receptionCategories, type ReceptionItem } from '@/data/builderMenuData';
import { Check } from 'lucide-react';
import { Diamond } from 'lucide-react';

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

export function StepReceptionDinner({ selections, onChange }: Props) {
  const sel = selections.reception;

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

      {/* Base package summary */}
      <div className="rounded-xl border p-5 mb-8" style={{ background: 'rgba(122,158,126,0.04)', borderColor: 'rgba(122,158,126,0.3)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Diamond size={12} style={{ color: '#7A9E7E' }} />
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>
            Base Package — $105pp
          </p>
        </div>
        <ul className="space-y-1">
          {[
            'Artisan bread service',
            '1 farm salad — choose from Salads below',
            '1 pasta or grain — choose from Pastas & Grains below',
            '2 protein entrées — choose from Poultry, Meats, or Fish below',
            '2 vegetables or starches — choose from Vegetables & Starches below',
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
        const grouped = groupBySubcategory(cat.items);

        return (
          <div key={cat.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>{cat.label}</p>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px]" style={{
                  color: selected.length > cat.included ? '#C9A84C' : '#6B6B6B',
                }}>
                  {selected.length} of {cat.included} included
                </span>
                {selected.length > cat.included && (
                  <span className="font-sans text-[9px]" style={{ color: '#C9A84C' }}>{cat.extraLabel}</span>
                )}
              </div>
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
                    const isExtra = isSelected && selIdx >= cat.included;

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
                          {item.season.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.season.map(s => (
                                <span key={s} className="font-sans text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                                  style={{ background: '#F0EDE8', color: '#6B6B6B' }}>{s.slice(0, 3).toUpperCase()}</span>
                              ))}
                            </div>
                          )}
                          {item.diet.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.diet.map(d => (
                                <span key={d} className="font-sans text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                                  style={{ background: '#F0EDE8', color: '#6B6B6B' }}>{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-sans text-[11px] font-medium whitespace-nowrap"
                          style={{ color: item.price > 0 ? '#C9A84C' : isSelected ? '#7A9E7E' : '#6B6B6B' }}>
                          {item.price > 0 ? `+$${item.price}pp` : isSelected ? 'INCLUDED' : '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
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
