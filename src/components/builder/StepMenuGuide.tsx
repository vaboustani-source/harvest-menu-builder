import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuideCards, useGuideSettings } from '@/hooks/useMenuGuide';
import { useMenuProgress, MILESTONE_DEFS, MILESTONE_COUPLE_LABELS, getMilestoneState } from '@/hooks/useMenuProgress';

interface Props {
  coupleId: string;
  builderStatus: string;
  onGoToStep: (step: number) => void;
}

const STATUS_COLORS = {
  complete: { bg: '#7A9E7E20', text: '#7A9E7E' },
  current: { bg: '#C9A84C20', text: '#C9A84C' },
  upcoming: { bg: '#F0EDE8', text: '#6B6B6B' },
};

function interpolateBody(body: string, settings: { revision_fee: number; call_fee: number }) {
  return body
    .replace(/\$\{\{revision_fee\}\}/g, String(settings.revision_fee))
    .replace(/\$\{\{call_fee\}\}/g, String(settings.call_fee));
}

export function StepMenuGuide({ coupleId, builderStatus, onGoToStep }: Props) {
  const { data: cards } = useGuideCards();
  const { data: milestones } = useMenuProgress(coupleId);
  const { data: settings } = useGuideSettings(coupleId);

  const isComplete = (name: string) => {
    const ms = getMilestoneState(milestones, name);
    return ms?.is_complete ?? false;
  };

  // Find the first incomplete milestone index
  const currentIndex = MILESTONE_DEFS.findIndex(def => !isComplete(def.name));
  const allComplete = currentIndex === -1;

  const isLocked = allComplete; // all milestones done = menu is set
  const hasStarted = builderStatus !== 'not_started';
  const isSubmitted = builderStatus === 'submitted';

  let ctaLabel = 'Begin Your Menu →';
  let ctaDisabled = false;
  if (isLocked) {
    ctaLabel = 'Your Menu Is Set.';
    ctaDisabled = true;
  } else if (isSubmitted) {
    ctaLabel = 'Open Your Revision →';
  } else if (hasStarted) {
    ctaLabel = 'Continue Where You Left Off →';
  }

  const fees = settings ?? { revision_fee: 100, call_fee: 200, out_of_season_enabled: false, out_of_season_amount: 0 };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section 1 — Intro */}
      <div className="mb-12">
        <h2 className="font-serif italic text-3xl md:text-4xl leading-tight mb-4" style={{ color: '#2C3E2D' }}>
          Your Menu, Your Weekend.
        </h2>
        <p className="font-serif italic text-base md:text-lg leading-relaxed" style={{ color: '#6B6B6B', lineHeight: 1.85 }}>
          This is where your weekend takes shape. Every meal — from Friday's rehearsal dinner to Sunday's farewell table — is built here, together. Take your time. Nothing is finalized until you're ready.
        </p>
      </div>

      {/* Section 2 — Progress Timeline */}
      <div className="mb-12">
        <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-6" style={{ color: '#2C3E2D' }}>
          Your Menu Process
        </p>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          <div className="flex items-start">
            {MILESTONE_DEFS.map((def, i) => {
              const complete = isComplete(def.name);
              const isCurrent = i === currentIndex;
              const label = MILESTONE_COUPLE_LABELS[def.name] ?? def.label;
              const statusStyle = complete ? STATUS_COLORS.complete : isCurrent ? STATUS_COLORS.current : STATUS_COLORS.upcoming;
              const statusLabel = complete ? 'COMPLETE' : isCurrent ? 'IN PROGRESS' : 'UPCOMING';

              return (
                <div key={def.name} className="flex-1 relative">
                  {i > 0 && (
                    <div
                      className="absolute top-3.5 right-1/2 w-full h-[2px]"
                      style={{ background: complete || isCurrent ? '#7A9E7E' : '#E8E2D9' }}
                    />
                  )}
                  <div className="relative flex flex-col items-center text-center px-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center relative z-10 shrink-0"
                      style={{
                        background: complete ? '#2C3E2D' : isCurrent ? '#C9A84C' : 'transparent',
                        border: !complete && !isCurrent ? '2px solid #E8E2D9' : 'none',
                      }}
                    >
                      {complete ? (
                        <Check size={12} style={{ color: '#C9A84C' }} />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>{i + 1}</span>
                      )}
                    </div>
                    <p
                      className="font-sans text-[11px] mt-2 leading-tight"
                      style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#2C3E2D' : '#6B6B6B' }}
                    >
                      {label}
                    </p>
                    <p className="font-sans text-[9px] mt-1 leading-snug" style={{ color: '#9A9A9A' }}>
                      {def.description}
                    </p>
                    <span
                      className="font-sans text-[8px] tracking-[0.15em] uppercase mt-2 px-2 py-0.5 rounded-full"
                      style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-0">
          {MILESTONE_DEFS.map((def, i) => {
            const complete = isComplete(def.name);
            const isCurrent = i === currentIndex;
            const label = MILESTONE_COUPLE_LABELS[def.name] ?? def.label;
            const statusStyle = complete ? STATUS_COLORS.complete : isCurrent ? STATUS_COLORS.current : STATUS_COLORS.upcoming;
            const statusLabel = complete ? 'COMPLETE' : isCurrent ? 'IN PROGRESS' : 'UPCOMING';

            return (
              <div key={def.name} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: complete ? '#2C3E2D' : isCurrent ? '#C9A84C' : 'transparent',
                      border: !complete && !isCurrent ? '2px solid #E8E2D9' : 'none',
                    }}
                  >
                    {complete ? (
                      <Check size={12} style={{ color: '#C9A84C' }} />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>{i + 1}</span>
                    )}
                  </div>
                  {i < MILESTONE_DEFS.length - 1 && (
                    <div className="w-[2px] flex-1 min-h-[24px]" style={{ background: complete ? '#7A9E7E' : '#E8E2D9' }} />
                  )}
                </div>
                <div className="pb-6 pt-0.5">
                  <p
                    className="font-sans text-[12px] leading-tight"
                    style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#2C3E2D' : '#6B6B6B' }}
                  >
                    {label}
                  </p>
                  <p className="font-sans text-[10px] mt-0.5 leading-snug" style={{ color: '#9A9A9A' }}>
                    {def.description}
                  </p>
                  <span
                    className="font-sans text-[8px] tracking-[0.15em] uppercase mt-1.5 inline-block px-2 py-0.5 rounded-full"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3 — Good to Know */}
      <div className="mb-12">
        <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-4" style={{ color: '#2C3E2D' }}>
          Good to Know
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(cards ?? []).map(card => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-5"
              style={{ borderLeft: '3px solid #C9A84C', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <p className="font-serif text-[15px] mb-2" style={{ color: '#2C3E2D' }}>
                {card.header}
              </p>
              <p className="font-sans text-[12px] leading-relaxed" style={{ color: '#6B6B6B' }}>
                {interpolateBody(card.body, fees)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — CTA */}
      <div className="mb-8">
        <Button
          onClick={() => onGoToStep(1)}
          disabled={ctaDisabled}
          className="w-full py-6 text-sm tracking-[0.15em] uppercase font-sans gap-2"
          style={{
            background: ctaDisabled ? '#E8E2D9' : '#2C3E2D',
            color: ctaDisabled ? '#6B6B6B' : '#FAF8F4',
            height: 'auto',
          }}
        >
          {ctaLabel}
          {!ctaDisabled && <ChevronRight size={16} />}
        </Button>
        {isLocked && (
          <p className="font-serif italic text-[12px] text-center mt-3" style={{ color: '#6B6B6B' }}>
            Reach out to your coordinator for any questions.
          </p>
        )}
      </div>
    </div>
  );
}
