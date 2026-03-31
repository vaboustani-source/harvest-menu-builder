import { STEPS } from '@/data/builderMenuData';
import { Check } from 'lucide-react';

interface Props {
  current: number;
  onChange: (step: number) => void;
}

export function ProgressStepper({ current, onChange }: Props) {
  return (
    <div className="border-b overflow-x-auto" style={{ borderColor: '#E8E2D9', background: '#FFFFFF' }}>
      <div className="max-w-[1200px] mx-auto px-4 flex">
        {STEPS.map((step, i) => {
          const isActive = i === current;
          const isCompleted = i < current;
          return (
            <button
              key={step.id}
              onClick={() => onChange(i)}
              className="flex items-center gap-2 px-4 py-3.5 flex-shrink-0 transition-all cursor-pointer border-b-2"
              style={{
                borderColor: isActive ? '#2C3E2D' : 'transparent',
                color: isActive ? '#2C3E2D' : isCompleted ? '#7A9E7E' : '#6B6B6B',
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans font-semibold shrink-0"
                style={{
                  background: isCompleted ? '#7A9E7E' : isActive ? '#2C3E2D' : 'transparent',
                  color: isCompleted || isActive ? '#FFFFFF' : '#6B6B6B',
                  border: !isCompleted && !isActive ? '1.5px solid #E8E2D9' : 'none',
                }}
              >
                {isCompleted ? <Check size={10} /> : i + 1}
              </span>
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase whitespace-nowrap font-medium hidden sm:inline">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
