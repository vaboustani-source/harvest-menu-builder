import { BuilderSelections, barAddOnItems } from '@/data/builderMenuData';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepNotes } from './StepNotes';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepBarPackage({ selections, onChange }: Props) {
  const selected = selections.barPackage.selectedAddOns ?? [];

  const toggleAddOn = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id];
    onChange({ barPackage: { ...selections.barPackage, selectedAddOns: next } });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2 text-sage">Bar Package</p>
        <h2 className="font-serif font-light text-3xl mb-2 text-grove">Every Glass Filled</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed text-text-muted-brand">
          Full service. Every glass filled. Every night covered.
        </p>
      </div>

      {/* Included info */}
      <div className="rounded-xl border border-cream-dark p-6 bg-white mb-6">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage mb-3">Always Included</p>
        <ul className="space-y-1.5">
          <li className="font-serif text-[14px] text-text-muted-brand leading-relaxed">• 1 Hour of Welcome Drinks — limited service</li>
          <li className="font-serif text-[14px] text-text-muted-brand leading-relaxed">• 1 Hour Cocktail Hour — full bar</li>
          <li className="font-serif text-[14px] text-text-muted-brand leading-relaxed">• Up to 5 Hours of Reception — full bar</li>
          <li className="font-serif text-[14px] text-text-muted-brand leading-relaxed">• Dedicated bartenders & full glassware service</li>
          <li className="font-serif text-[14px] text-text-muted-brand leading-relaxed">• Non-alcoholic options always available</li>
        </ul>
      </div>

      {/* Add-On Options */}
      <div className="rounded-xl border border-cream-dark p-6 bg-white">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm mb-4">Add-On Options</p>
        <div className="space-y-3">
          {barAddOnItems.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-cream/50"
              style={{
                borderColor: selected.includes(item.id) ? '#7A9E7E' : '#E8E2D9',
                background: selected.includes(item.id) ? 'rgba(122,158,126,0.04)' : undefined,
              }}
            >
              <Checkbox
                checked={selected.includes(item.id)}
                onCheckedChange={() => toggleAddOn(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <span className="font-serif text-[15px] text-grove leading-snug">{item.name}</span>
                {item.priceLabel && (
                  <span className="font-sans text-[13px] font-semibold text-warm ml-2">{item.priceLabel}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase mb-2 text-text-muted-brand">
          Bar notes or special requests
        </p>
        <Textarea
          value={selections.barPackage.notes}
          onChange={e => onChange({ barPackage: { ...selections.barPackage, notes: e.target.value } })}
          placeholder="Specialty cocktails, preferences, restrictions…"
          className="border-cream-dark bg-white font-serif text-sm min-h-[100px] resize-none"
        />
      </div>

      <StepNotes stepLabel="Bar Package" value={selections.stepNotes.barPackage}
        onChange={v => onChange({ stepNotes: { ...selections.stepNotes, barPackage: v } })} />
    </div>
  );
}
