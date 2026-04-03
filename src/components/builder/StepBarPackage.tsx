import { BuilderSelections } from '@/data/builderMenuData';
import { Textarea } from '@/components/ui/textarea';
import { StepNotes } from './StepNotes';

interface Props {
  selections: BuilderSelections;
  onChange: (updates: Partial<BuilderSelections>) => void;
}

export function StepBarPackage({ selections, onChange }: Props) {
  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Bar Package</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>Every Glass Filled</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Full service. Every glass filled. Every night covered.
        </p>
      </div>

      <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
        <p className="font-sans text-[11px] italic mb-4" style={{ color: '#C9A84C' }}>
          [Bar package tiers to be added — coordinate with Brandon]
        </p>
        <p className="font-serif italic text-[13px] mb-3" style={{ color: '#6B6B6B' }}>
          Nothing selected yet. Take your time.
        </p>
      </div>

      <div className="mt-6">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: '#6B6B6B' }}>
          Bar notes or special requests
        </p>
        <Textarea
          value={selections.barPackage.notes}
          onChange={e => onChange({ barPackage: { notes: e.target.value } })}
          placeholder="Specialty cocktails, preferences, restrictions…"
          className="border-[#E8E2D9] bg-white font-serif text-sm min-h-[100px] resize-none"
        />
      </div>

      <StepNotes stepLabel="Bar Package" value={selections.stepNotes.barPackage}
        onChange={v => onChange({ stepNotes: { ...selections.stepNotes, barPackage: v } })} />
    </div>
  );
}
