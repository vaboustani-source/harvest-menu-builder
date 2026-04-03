import { Textarea } from '@/components/ui/textarea';

interface Props {
  stepLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export function StepNotes({ stepLabel, value, onChange }: Props) {
  return (
    <div className="mt-10 pt-6 border-t" style={{ borderColor: '#E8E2D9' }}>
      <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: '#2C3E2D' }}>
        {stepLabel} Notes
      </p>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Dietary needs, special requests, questions for your coordinator..."
        rows={4}
        className="border-[#E8E2D9] bg-white font-serif text-sm italic min-h-[100px] resize-none placeholder:italic placeholder:text-[#C9A84C80]"
      />
    </div>
  );
}
