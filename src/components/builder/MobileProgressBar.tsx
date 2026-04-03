import { STEPS } from '@/data/builderMenuData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  current: number;
  onChange: (step: number) => void;
}

export function MobileProgressBar({ current, onChange }: Props) {
  const total = STEPS.length;
  const step = STEPS[current];

  return (
    <div className="md:hidden" style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E2D9' }}>
      {/* Progress bar */}
      <div className="w-full h-[3px] flex" style={{ background: '#F0EDE8' }}>
        {STEPS.map((_, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;
          return (
            <div
              key={i}
              className="flex-1 transition-all duration-300"
              style={{
                background: isCompleted ? '#C9A84C' : isCurrent ? '#2C3E2D' : 'transparent',
              }}
            />
          );
        })}
      </div>

      {/* Step info with arrows */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => current > 0 && onChange(current - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            color: current > 0 ? '#2C3E2D' : '#E8E2D9',
            cursor: current > 0 ? 'pointer' : 'default',
          }}
          disabled={current === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center flex-1">
          <p className="font-serif text-xl leading-tight" style={{ color: '#2C3E2D' }}>
            {step.label}
          </p>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase mt-0.5" style={{ color: '#6B6B6B' }}>
            Step {current + 1} of {total}
          </p>
        </div>

        <button
          onClick={() => current < total - 1 && onChange(current + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            color: current < total - 1 ? '#2C3E2D' : '#E8E2D9',
            cursor: current < total - 1 ? 'pointer' : 'default',
          }}
          disabled={current === total - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
