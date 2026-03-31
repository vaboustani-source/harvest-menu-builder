import { BuilderSelections, cocktailHourItems, COCKTAIL_INCLUDED_COUNT } from '@/data/builderMenuData';
import { Check } from 'lucide-react';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepCocktailHour({ selections, onChange }: Props) {
  const selected = selections.cocktailHour;
  const includedUsed = Math.min(selected.length, COCKTAIL_INCLUDED_COUNT);

  const toggle = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id];
    onChange({ cocktailHour: updated });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Cocktail Hour</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>The First Pour</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          One hour. Four selections. Every bite passed by Gilbertsville staff.
        </p>
      </div>

      {/* Counter */}
      <div className="rounded-xl border px-5 py-3.5 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(122,158,126,0.04)', borderColor: 'rgba(122,158,126,0.3)' }}>
        <p className="font-sans text-[11px]" style={{ color: '#2C3E2D' }}>
          <span className="font-semibold">{includedUsed}</span> of {COCKTAIL_INCLUDED_COUNT} included selections made
        </p>
        {selected.length > COCKTAIL_INCLUDED_COUNT && (
          <p className="font-sans text-[10px]" style={{ color: '#C9A84C' }}>
            +{selected.length - COCKTAIL_INCLUDED_COUNT} additional
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cocktailHourItems.map((item, idx) => {
          const isSelected = selected.includes(item.id);
          const selectionIndex = isSelected ? selected.indexOf(item.id) : -1;
          const isExtra = isSelected && selectionIndex >= COCKTAIL_INCLUDED_COUNT;

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
                {item.diet.map(d => (
                  <span key={d} className="font-sans text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{ background: '#F0EDE8', color: '#6B6B6B' }}>{d}</span>
                ))}
              </div>
              <p className="font-sans text-[11px] font-medium mt-2"
                style={{ color: isExtra ? '#C9A84C' : isSelected ? '#7A9E7E' : '#6B6B6B' }}>
                {isSelected && !isExtra ? 'INCLUDED' : `$${item.price}pp`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
