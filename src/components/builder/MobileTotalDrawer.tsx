import { useState } from 'react';
import { BuilderSelections, calculateTotal, rehearsalThemes } from '@/data/builderMenuData';
import { usePricingData } from '@/hooks/usePricingConfig';
import { ChevronUp, X } from 'lucide-react';

interface Props {
  selections: BuilderSelections;
  guestCount: number | null;
}

export function MobileStickyTotal({ selections, guestCount }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pricing = usePricingData();
  const total = calculateTotal(selections, pricing);
  const theme = selections.rehearsalDinner.themeId
    ? rehearsalThemes.find(t => t.id === selections.rehearsalDinner.themeId)
    : null;

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/30 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed left-0 right-0 z-[70] transition-transform duration-300 ease-in-out rounded-t-2xl`}
        style={{
          background: '#FAF8F4',
          bottom: '56px',
          maxHeight: '70vh',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: drawerOpen ? '0 -8px 30px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div className="overflow-y-auto p-5" style={{ maxHeight: '70vh' }}>
          {/* Close button */}
          <div className="flex justify-between items-center mb-4">
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase font-semibold" style={{ color: '#2C3E2D' }}>
              Your Running Total
            </p>
            <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full"
              style={{ color: '#6B6B6B' }}>
              <X size={16} />
            </button>
          </div>

          {/* Base package */}
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Base Reception Package</span>
            <span className="font-sans text-[12px] font-medium" style={{ color: '#1A1A1A' }}>${total.basePackage}pp</span>
          </div>
          <p className="font-sans text-[10px] italic mb-4" style={{ color: '#6B6B6B' }}>Starting at</p>

          {/* Rehearsal dinner */}
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
                  <span className="font-sans text-[11px]" style={{ color: '#6B6B6B' }}>{li.label}</span>
                  <span className="font-sans text-[11px] font-medium whitespace-nowrap" style={{ color: '#C9A84C' }}>+${li.amount}pp</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: '#E8E2D9' }}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-sans text-[11px] font-medium" style={{ color: '#1A1A1A' }}>Total Upcharges</span>
              <span className="font-sans text-[12px] font-semibold" style={{ color: '#C9A84C' }}>+${total.totalUpcharges}pp</span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <span className="font-sans text-[12px] font-semibold" style={{ color: '#2C3E2D' }}>Estimated Per Person</span>
              <span className="font-serif text-xl font-light" style={{ color: '#2C3E2D' }}>${total.estimatedPerPerson}pp</span>
            </div>
            {guestCount ? (
              <div className="flex justify-between items-baseline mt-1">
                <span className="font-sans text-[10px]" style={{ color: '#6B6B6B' }}>Est. Total ({guestCount} guests)</span>
                <span className="font-sans text-[12px] font-medium" style={{ color: '#2C3E2D' }}>
                  ${(total.estimatedPerPerson * guestCount).toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="font-sans text-[10px] italic mt-1" style={{ color: '#C9A84C' }}>
                Est. Total (guest count not yet set — contact your coordinator)
              </p>
            )}
          </div>

          <p className="font-serif italic text-[10px] mt-4 leading-relaxed" style={{ color: '#6B6B6B' }}>
            Final pricing confirmed with your coordinator.
          </p>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-center justify-between px-5"
        style={{ background: '#2C3E2D', height: '56px' }}>
        <div>
          <p className="font-sans text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(250,248,244,0.6)' }}>
            Est. Total
          </p>
          <p className="font-serif text-lg font-light leading-tight" style={{ color: '#FAF8F4' }}>
            ${total.estimatedPerPerson}pp
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-sans font-medium tracking-wide"
          style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)' }}
        >
          <ChevronUp size={12} className={`transition-transform ${drawerOpen ? 'rotate-180' : ''}`} />
          {drawerOpen ? 'Close' : 'Details'}
        </button>
      </div>
    </>
  );
}
