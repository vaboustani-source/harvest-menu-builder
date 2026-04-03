import { BuilderSelections } from '@/data/builderMenuData';
import { Switch } from '@/components/ui/switch';
import { usePricingData } from '@/hooks/usePricingConfig';
import { StepNotes } from './StepNotes';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepMealInclusions({ selections, onChange }: Props) {
  const sel = selections.mealInclusions;

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Meal Inclusions</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>Every Meal, Accounted For</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Every meal of your weekend, accounted for.
        </p>
      </div>

      <div className="space-y-4">
        {/* Arrival Lunch */}
        <MealCard title="Arrival Lunch"
          body="Buffet-style lunch service as guests arrive Friday afternoon."
          placeholder="[Upgrade options to be added — coordinate with Brandon]" />

        {/* Wedding Day Breakfast */}
        <MealCard title="Wedding Day Breakfast"
          body="Served the morning of your wedding. Buffet style with full staffing."
          placeholder="[Upgrade options to be added — coordinate with Brandon]" />

        {/* Farewell Breakfast */}
        <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#2C3E2D' }}>
            Farewell Breakfast
          </p>
          <p className="font-serif text-[13px] italic mb-4" style={{ color: '#6B6B6B' }}>
            Sunday morning. The last meal together before the weekend closes.
          </p>
          <div className="space-y-3">
            <ToggleUpgrade label="Mimosa Bar" itemKey="mimosa_bar" fallbackPrice={20} checked={sel.mimosaBar}
              onChange={v => onChange({ mealInclusions: { ...sel, mimosaBar: v } })} />
            <ToggleUpgrade label="Bloody Mary Bar" itemKey="bloody_mary_bar" fallbackPrice={20} checked={sel.bloodyMaryBar}
              onChange={v => onChange({ mealInclusions: { ...sel, bloodyMaryBar: v } })} />
            <ToggleUpgrade label="Upgrade to Farewell Brunch" subtitle="Extend the morning with a full brunch spread." itemKey="farewell_brunch" fallbackPrice={25} checked={sel.farewellBrunch}
              onChange={v => onChange({ mealInclusions: { ...sel, farewellBrunch: v } })} />
          </div>
        </div>
      </div>

      <StepNotes stepLabel="Meal Inclusions" value={selections.stepNotes.mealInclusions}
        onChange={v => onChange({ stepNotes: { ...selections.stepNotes, mealInclusions: v } })} />
    </div>
  );
}

function MealCard({ title, body, placeholder }: { title: string; body: string; placeholder: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
      <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#2C3E2D' }}>{title}</p>
      <p className="font-serif text-[13px] italic mb-3" style={{ color: '#6B6B6B' }}>{body}</p>
      <p className="font-sans text-[11px] italic" style={{ color: '#C9A84C' }}>{placeholder}</p>
    </div>
  );
}

function ToggleUpgrade({ label, subtitle, itemKey, fallbackPrice, checked, onChange }: {
  label: string; subtitle?: string; itemKey: string; fallbackPrice: number; checked: boolean; onChange: (v: boolean) => void;
}) {
  const pricing = usePricingData();
  const price = pricing.getPrice(itemKey) ?? fallbackPrice;
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border" style={{ borderColor: '#E8E2D9' }}>
      <div>
        <p className="font-sans text-[12px] font-medium" style={{ color: '#1A1A1A' }}>{label}</p>
        {subtitle && <p className="font-serif text-[11px] italic" style={{ color: '#6B6B6B' }}>{subtitle}</p>}
        <p className="font-sans text-[10px]" style={{ color: '#C9A84C' }}>+${price}pp</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
