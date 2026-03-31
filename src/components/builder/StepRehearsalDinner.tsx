import { BuilderSelections, rehearsalThemes } from '@/data/builderMenuData';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepRehearsalDinner({ selections, onChange }: Props) {
  const sel = selections.rehearsalDinner;

  const selectTheme = (id: string) => {
    const isDeselect = sel.themeId === id;
    onChange({
      rehearsalDinner: {
        ...sel,
        themeId: isDeselect ? null : id,
        addOnSelected: isDeselect ? false : sel.addOnSelected,
      },
    });
  };

  const toggleAddOn = () => {
    onChange({ rehearsalDinner: { ...sel, addOnSelected: !sel.addOnSelected } });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Rehearsal Dinner</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>Set the Tone</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Intimate, unhurried, and intentionally warm. The rehearsal dinner sets the tone for the weekend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rehearsalThemes.map(theme => {
          const isSelected = sel.themeId === theme.id;
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
              <p className="font-sans text-[10px] italic mb-3" style={{ color: '#C9A84C' }}>{theme.season}</p>

              <div className="flex gap-1.5 mb-3">
                {theme.dietaryTags.map(tag => (
                  <span key={tag} className="font-sans text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{ background: '#F0EDE8', color: '#6B6B6B' }}>{tag}</span>
                ))}
              </div>

              <ul className="space-y-1 mb-4">
                {theme.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: '#2C3E2D' }} />
                    <span className="font-serif text-[12.5px] leading-relaxed" style={{ color: '#1A1A1A' }}>{item}</span>
                  </li>
                ))}
              </ul>

              {theme.addOn && (
                <div className="pt-3 border-t" style={{ borderColor: '#E8E2D9' }}>
                  <p className="font-sans text-[10px]" style={{ color: '#C9A84C' }}>
                    <span className="font-semibold">+</span> {theme.addOn.name} — +${theme.addOn.price}pp
                  </p>
                </div>
              )}

              <p className="font-serif text-xl font-light mt-3" style={{ color: '#2C3E2D' }}>
                ${theme.price}<span className="text-sm">pp</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* Add-on toggle for selected theme */}
      {sel.themeId && (() => {
        const theme = rehearsalThemes.find(t => t.id === sel.themeId);
        if (!theme?.addOn) return null;
        return (
          <div className="mt-6 rounded-xl p-5 border" style={{ background: '#FBF9F5', borderColor: '#E8E2D9' }}>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-sans text-[11px] font-medium" style={{ color: '#2C3E2D' }}>
                  <span style={{ color: '#C9A84C' }}>+</span> {theme.addOn.name}
                </p>
                <p className="font-sans text-[10px] italic" style={{ color: '#C9A84C' }}>+${theme.addOn.price}pp</p>
              </div>
              <input type="checkbox" checked={sel.addOnSelected} onChange={toggleAddOn}
                className="w-5 h-5 rounded accent-[#2C3E2D]" />
            </label>
          </div>
        );
      })()}

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
    </div>
  );
}
