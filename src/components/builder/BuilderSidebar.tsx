import { BuilderSelections, calculateTotal, rehearsalThemes } from '@/data/builderMenuData';
import { usePricingData } from '@/hooks/usePricingConfig';

interface Props {
  selections: BuilderSelections;
  guestCount: number | null;
}

export function BuilderSidebar({ selections, guestCount }: Props) {
  const pricing = usePricingData();
  const total = calculateTotal(selections, pricing);
  const theme = selections.rehearsalDinner.themeId
    ? rehearsalThemes.find(t => t.id === selections.rehearsalDinner.themeId)
    : null;

  return (
    <div className="w-[300px] shrink-0 border-l p-6 hidden lg:block sticky top-[120px] self-start h-fit"
      style={{ borderColor: '#E8E2D9', background: '#FFFFFF' }}>
      <p className="font-sans text-[9px] tracking-[0.35em] uppercase font-semibold mb-4" style={{ color: '#2C3E2D' }}>
        Your Running Total
      </p>

      {/* Base package */}
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Base Reception Package</span>
        <span className="font-sans text-[12px] font-medium" style={{ color: '#1A1A1A' }}>${total.basePackage}pp</span>
      </div>
      <p className="font-sans text-[10px] italic mb-4" style={{ color: '#6B6B6B' }}>Starting at</p>

      {/* Rehearsal dinner — base cost line */}
      {theme && (
        <>
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Rehearsal Dinner — {theme.name}</span>
            <span className="font-sans text-[12px] font-medium" style={{ color: '#1A1A1A' }}>${total.rehearsalDinnerCost}pp</span>
          </div>
          <p className="font-sans text-[10px] italic mb-4" style={{ color: '#6B6B6B' }}>Starting at</p>
        </>
      )}

      {/* Line items */}
      {total.lineItems.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: '#E8E2D9' }}>
          {total.lineItems.map((li, i) => (
            <div key={i} className="flex justify-between items-baseline gap-2">
              <span className="font-sans text-[11px] truncate" style={{ color: '#6B6B6B' }}>{li.label}</span>
              <span className="font-sans text-[11px] font-medium whitespace-nowrap" style={{ color: '#C9A84C' }}>+${li.amount}pp</span>
            </div>
          ))}
        </div>
      )}

      {/* Subtotal */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: '#E8E2D9' }}>
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-sans text-[11px] font-medium" style={{ color: '#1A1A1A' }}>Total Upcharges</span>
          <span className="font-sans text-[12px] font-semibold" style={{ color: '#C9A84C' }}>
            +${total.totalUpcharges}pp
          </span>
        </div>
        <div className="flex justify-between items-baseline mt-2">
          <span className="font-sans text-[12px] font-semibold" style={{ color: '#2C3E2D' }}>Estimated Per Person</span>
          <span className="font-serif text-xl font-light" style={{ color: '#2C3E2D' }}>${total.estimatedPerPerson}pp</span>
        </div>
        {guestCount && (
          <div className="flex justify-between items-baseline mt-1">
            <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>Est. Total ({guestCount} guests)</span>
            <span className="font-sans text-[12px] font-medium" style={{ color: '#2C3E2D' }}>
              ${(total.estimatedPerPerson * guestCount).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <p className="font-serif italic text-[10px] mt-4 leading-relaxed" style={{ color: '#6B6B6B' }}>
        Final pricing confirmed with your coordinator.
      </p>
    </div>
  );
}

// Mobile version shown at bottom
export function MobileTotalBar({ selections }: { selections: BuilderSelections }) {
  const pricing = usePricingData();
  const total = calculateTotal(selections, pricing);
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
      <div className="flex items-center justify-between max-w-[600px] mx-auto">
        <div>
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase" style={{ color: '#6B6B6B' }}>Estimated Total</p>
          <p className="font-serif text-lg font-light" style={{ color: '#2C3E2D' }}>${total.estimatedPerPerson}pp</p>
        </div>
        <div className="text-right">
          <p className="font-sans text-[10px]" style={{ color: '#C9A84C' }}>+${total.totalUpcharges}pp upcharges</p>
          <p className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>${total.basePackage}pp base included</p>
        </div>
      </div>
    </div>
  );
}
