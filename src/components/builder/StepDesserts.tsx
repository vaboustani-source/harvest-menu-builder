import { BuilderSelections } from '@/data/builderMenuData';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepDesserts({ selections, onChange }: Props) {
  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Desserts</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>The Sweet End</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          The sweet end to the evening.
        </p>
      </div>

      <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
        <p className="font-sans text-[11px] italic mb-4" style={{ color: '#C9A84C' }}>
          [Dessert menu items to be added — coordinate with Brandon]
        </p>
        <p className="font-serif italic text-[13px] mb-3" style={{ color: '#6B6B6B' }}>
          Nothing selected yet. Take your time.
        </p>
      </div>

      <div className="mt-6">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: '#6B6B6B' }}>
          Notes or special requests for dessert
        </p>
        <Textarea
          value={selections.desserts.notes}
          onChange={e => onChange({ desserts: { notes: e.target.value } })}
          placeholder="Share your vision…"
          className="border-[#E8E2D9] bg-white font-serif text-sm min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
}
