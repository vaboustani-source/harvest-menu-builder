import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuideCards, useMilestones, useGuideSettings } from '@/hooks/useMenuGuide';

interface Props {
  coupleId: string;
  builderStatus: string;
  onGoToStep: (step: number) => void;
}

const MILESTONES = [
  { num: 1, label: 'Build Your Draft', desc: 'Work through each meal moment and submit your first selections.', statuses: ['not_started', 'in_progress', 'submitted'] },
  { num: 2, label: 'Review Call with Brandon', desc: 'Your coordinator reviews your draft with you. Questions answered. Adjustments noted.', statuses: ['pending', 'scheduled', 'complete'] },
  { num: 3, label: 'First Revision', desc: 'One round of changes after your review call.', statuses: ['not_started', 'in_progress', 'submitted'] },
  { num: 4, label: 'The Tasting', desc: 'You come to the estate. You eat. The menu earns its place.', statuses: ['pending', 'scheduled', 'complete'] },
  { num: 5, label: 'Final Revision', desc: 'One last round of changes after the tasting. Then it\'s set.', statuses: ['not_started', 'in_progress', 'locked'] },
];

const STATUS_LABELS: Record<string, string> = {
  not_started: 'NOT STARTED',
  in_progress: 'IN PROGRESS',
  submitted: 'SUBMITTED',
  pending: 'PENDING',
  scheduled: 'SCHEDULED',
  complete: 'COMPLETE',
  locked: 'LOCKED',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  not_started: { bg: '#F0EDE8', text: '#6B6B6B' },
  in_progress: { bg: '#C9A84C20', text: '#C9A84C' },
  submitted: { bg: '#7A9E7E20', text: '#7A9E7E' },
  pending: { bg: '#F0EDE8', text: '#6B6B6B' },
  scheduled: { bg: '#C9A84C20', text: '#C9A84C' },
  complete: { bg: '#7A9E7E20', text: '#7A9E7E' },
  locked: { bg: '#2C3E2D20', text: '#2C3E2D' },
};

function interpolateBody(body: string, settings: { revision_fee: number; call_fee: number }) {
  return body
    .replace(/\$\{\{revision_fee\}\}/g, String(settings.revision_fee))
    .replace(/\$\{\{call_fee\}\}/g, String(settings.call_fee));
}

export function StepMenuGuide({ coupleId, builderStatus, onGoToStep }: Props) {
  const { data: cards } = useGuideCards();
  const { data: milestones } = useMilestones(coupleId);
  const { data: settings } = useGuideSettings(coupleId);

  const getMilestoneStatus = (stepNum: number): string => {
    const m = milestones?.find(ms => ms.step_number === stepNum);
    if (m) return m.status;
    // Auto-derive step 1 from builder status
    if (stepNum === 1) {
      if (builderStatus === 'submitted') return 'submitted';
      if (builderStatus === 'in_progress') return 'in_progress';
    }
    return MILESTONES.find(ms => ms.num === stepNum)?.statuses[0] ?? 'not_started';
  };

  // Find the first non-complete milestone to determine "current"
  const currentMilestone = MILESTONES.findIndex(m => {
    const s = getMilestoneStatus(m.num);
    return s !== 'complete' && s !== 'submitted' && s !== 'locked';
  });

  const isLocked = getMilestoneStatus(5) === 'locked';
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
            {MILESTONES.map((m, i) => {
              const status = getMilestoneStatus(m.num);
              const isComplete = status === 'complete' || status === 'submitted' || status === 'locked';
              const isCurrent = i === currentMilestone;
              const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.not_started;

              return (
                <div key={m.num} className="flex-1 relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div
                      className="absolute top-3.5 right-1/2 w-full h-[2px]"
                      style={{ background: isComplete || isCurrent ? '#7A9E7E' : '#E8E2D9' }}
                    />
                  )}
                  <div className="relative flex flex-col items-center text-center px-2">
                    {/* Circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center relative z-10 shrink-0"
                      style={{
                        background: isComplete ? '#2C3E2D' : isCurrent ? '#C9A84C' : 'transparent',
                        border: !isComplete && !isCurrent ? '2px solid #E8E2D9' : 'none',
                      }}
                    >
                      {isComplete ? (
                        <Check size={12} style={{ color: '#C9A84C' }} />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>{m.num}</span>
                      )}
                    </div>
                    {/* Label */}
                    <p
                      className="font-sans text-[11px] mt-2 leading-tight"
                      style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#2C3E2D' : '#6B6B6B' }}
                    >
                      {m.label}
                    </p>
                    <p className="font-sans text-[9px] mt-1 leading-snug" style={{ color: '#9A9A9A' }}>
                      {m.desc}
                    </p>
                    {/* Status badge */}
                    <span
                      className="font-sans text-[8px] tracking-[0.15em] uppercase mt-2 px-2 py-0.5 rounded-full"
                      style={{ background: statusColor.bg, color: statusColor.text }}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-0">
          {MILESTONES.map((m, i) => {
            const status = getMilestoneStatus(m.num);
            const isComplete = status === 'complete' || status === 'submitted' || status === 'locked';
            const isCurrent = i === currentMilestone;
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.not_started;

            return (
              <div key={m.num} className="flex gap-4">
                {/* Vertical line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isComplete ? '#2C3E2D' : isCurrent ? '#C9A84C' : 'transparent',
                      border: !isComplete && !isCurrent ? '2px solid #E8E2D9' : 'none',
                    }}
                  >
                    {isComplete ? (
                      <Check size={12} style={{ color: '#C9A84C' }} />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>{m.num}</span>
                    )}
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-[2px] flex-1 min-h-[24px]" style={{ background: isComplete ? '#7A9E7E' : '#E8E2D9' }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6 pt-0.5">
                  <p
                    className="font-sans text-[12px] leading-tight"
                    style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#2C3E2D' : '#6B6B6B' }}
                  >
                    {m.label}
                  </p>
                  <p className="font-sans text-[10px] mt-0.5 leading-snug" style={{ color: '#9A9A9A' }}>
                    {m.desc}
                  </p>
                  <span
                    className="font-sans text-[8px] tracking-[0.15em] uppercase mt-1.5 inline-block px-2 py-0.5 rounded-full"
                    style={{ background: statusColor.bg, color: statusColor.text }}
                  >
                    {STATUS_LABELS[status] ?? status}
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
