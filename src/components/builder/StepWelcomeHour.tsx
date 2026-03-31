import { BuilderSelections, welcomeOptions, spritzerOptions } from '@/data/builderMenuData';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepWelcomeHour({ selections, onChange }: Props) {
  const sel = selections.welcomeHour;
  const beverages = welcomeOptions.filter(o => o.category === 'beverage');
  const waters = welcomeOptions.filter(o => o.category === 'infused-water');

  const toggleNonAlcoholic = (id: string) => {
    const current = sel.nonAlcoholic;
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : current.length >= 2 ? current : [...current, id];
    onChange({ welcomeHour: { ...sel, nonAlcoholic: updated } });
  };

  const selectSpritzer = (id: string) => {
    onChange({ welcomeHour: { ...sel, spritzer: sel.spritzer === id ? null : id } });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Welcome Hour</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>First Impressions</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Two non-alcoholic selections. One wine spritzer. Ready before the first guest arrives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Non-alcoholic panel */}
        <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>
              Non-Alcoholic Selections
            </p>
            <span className="font-sans text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: sel.nonAlcoholic.length >= 2 ? '#7A9E7E' : '#F0EDE8', color: sel.nonAlcoholic.length >= 2 ? '#FFF' : '#6B6B6B' }}>
              {sel.nonAlcoholic.length} of 2
            </span>
          </div>

          <p className="font-sans text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#C9A84C' }}>Beverages</p>
          <div className="space-y-2 mb-4">
            {beverages.map(opt => (
              <SelectableItem key={opt.id} label={opt.name}
                selected={sel.nonAlcoholic.includes(opt.id)}
                disabled={!sel.nonAlcoholic.includes(opt.id) && sel.nonAlcoholic.length >= 2}
                onClick={() => toggleNonAlcoholic(opt.id)} />
            ))}
          </div>

          <p className="font-sans text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#C9A84C' }}>Infused Flavored Waters</p>
          <div className="space-y-2">
            {waters.map(opt => (
              <SelectableItem key={opt.id} label={opt.name}
                selected={sel.nonAlcoholic.includes(opt.id)}
                disabled={!sel.nonAlcoholic.includes(opt.id) && sel.nonAlcoholic.length >= 2}
                onClick={() => toggleNonAlcoholic(opt.id)} />
            ))}
          </div>
        </div>

        {/* Spritzer panel */}
        <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#2C3E2D' }}>
            Wine Spritzers — Choose 1
          </p>
          <p className="font-sans text-[9px] tracking-[0.15em] uppercase mb-4" style={{ color: '#C9A84C' }}>
            Sauvignon Blanc · Pinot Grigio · Rosé
          </p>
          <div className="space-y-2">
            {spritzerOptions.map(opt => (
              <SelectableItem key={opt.id} label={opt.name}
                selected={sel.spritzer === opt.id}
                onClick={() => selectSpritzer(opt.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Service note */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E8E2D9' }}>
        <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: '#2C3E2D' }}>
          Service Included
        </p>
        <p className="font-serif italic text-[13px] mb-6" style={{ color: '#6B6B6B' }}>
          Station drink service in cocktail cups — included in your reception pricing.
        </p>

        {/* Upgrade toggle */}
        <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: '#2C3E2D' }}>
          <div>
            <p className="font-sans text-[11px] font-medium" style={{ color: '#FAF8F4' }}>
              <span style={{ color: '#C9A84C' }}>+</span> UPGRADE — Passed drink service in glassware
            </p>
            <p className="font-serif italic text-[11px] mt-0.5" style={{ color: 'rgba(250,248,244,0.6)' }}>
              Includes Saratoga still & sparkling water
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[12px] font-medium" style={{ color: '#C9A84C' }}>$8pp</span>
            <Switch checked={sel.passedServiceUpgrade}
              onCheckedChange={v => onChange({ welcomeHour: { ...sel, passedServiceUpgrade: v } })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectableItem({ label, selected, disabled, onClick }: {
  label: string; selected: boolean; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all"
      style={{
        borderColor: selected ? '#2C3E2D' : '#E8E2D9',
        background: selected ? 'rgba(122,158,126,0.05)' : 'transparent',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{
          borderColor: selected ? '#2C3E2D' : '#E8E2D9',
          background: selected ? '#2C3E2D' : 'transparent',
        }}>
        {selected && <Check size={10} color="#FFFFFF" />}
      </span>
      <span className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{label}</span>
    </button>
  );
}
