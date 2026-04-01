import { BuilderSelections, calculateTotal, rehearsalThemes, welcomeOptions, spritzerOptions, cocktailHourItems, receptionCategories, COCKTAIL_INCLUDED_COUNT } from '@/data/builderMenuData';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { usePricingData } from '@/hooks/usePricingConfig';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  selections: BuilderSelections;
  guestCount: number | null;
  status: string;
  saving: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function StepReview({ selections, guestCount, status, saving, onSaveDraft, onSubmit }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = calculateTotal(selections);
  const sel = selections;

  const theme = sel.rehearsalDinner.themeId ? rehearsalThemes.find(t => t.id === sel.rehearsalDinner.themeId) : null;
  const nonAlcNames = sel.welcomeHour.nonAlcoholic.map(id => welcomeOptions.find(o => o.id === id)?.name).filter(Boolean);
  const spritzerNames = sel.welcomeHour.spritzers.map(id => spritzerOptions.find(o => o.id === id)?.name).filter(Boolean);
  const cocktailNames = sel.cocktailHour.map(id => cocktailHourItems.find(i => i.id === id)).filter(Boolean);

  const catKeyMap: Record<string, keyof typeof sel.reception> = {
    'salads': 'salads', 'pastas-grains': 'pastasGrains', 'proteins': 'proteins', 'vegetables-starches': 'vegetablesStarches',
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#7A9E7E' }}>Review & Submit</p>
        <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#2C3E2D' }}>Your Weekend Menu</h2>
        <p className="font-serif italic text-[15px] max-w-xl leading-relaxed" style={{ color: '#6B6B6B' }}>
          Review your selections below. Everything saves automatically.
        </p>
      </div>

      {/* Rehearsal Dinner */}
      <ReviewSection title="Rehearsal Dinner">
        {theme ? (
          <div>
            <p className="font-serif text-[14px]" style={{ color: '#1A1A1A' }}>{theme.name} — ${theme.price}pp</p>
            {sel.rehearsalDinner.addOnSelected && theme.addOn && (
              <p className="font-sans text-[11px] mt-1" style={{ color: '#C9A84C' }}>+ {theme.addOn.name} (+${theme.addOn.price}pp)</p>
            )}
          </div>
        ) : <EmptyState />}
      </ReviewSection>

      {/* Welcome Hour */}
      <ReviewSection title="Welcome Hour">
        {nonAlcNames.length > 0 || spritzerNames.length > 0 ? (
          <div className="space-y-1">
            {nonAlcNames.map((n, i) => <p key={i} className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{n}</p>)}
            {spritzerNames.map((n, i) => <p key={`s-${i}`} className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{n}</p>)}
            {sel.welcomeHour.passedServiceUpgrade && (
              <p className="font-sans text-[11px] mt-1" style={{ color: '#C9A84C' }}>+ Passed Service Upgrade (+$8pp)</p>
            )}
            {sel.welcomeHour.champagneUpgrade && (
              <p className="font-sans text-[11px] mt-1" style={{ color: '#C9A84C' }}>+ Champagne Welcome Station (+$5pp)</p>
            )}
          </div>
        ) : <EmptyState />}
      </ReviewSection>

      {/* Cocktail Hour */}
      <ReviewSection title="Cocktail Hour">
        {cocktailNames.length > 0 ? (
          <div className="space-y-1">
            {cocktailNames.map((item, i) => item && (
              <div key={i} className="flex justify-between">
                <span className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{item.name}</span>
                <span className="font-sans text-[10px]" style={{ color: i >= COCKTAIL_INCLUDED_COUNT ? '#C9A84C' : '#7A9E7E' }}>
                  {i >= COCKTAIL_INCLUDED_COUNT ? `+$${item.price}pp` : 'INCLUDED'}
                </span>
              </div>
            ))}
          </div>
        ) : <EmptyState />}
      </ReviewSection>

      {/* Reception */}
      <ReviewSection title="Reception Dinner">
        {receptionCategories.map(cat => {
          const key = catKeyMap[cat.id];
          const selectedIds = sel.reception[key];
          if (selectedIds.length === 0) return null;
          return (
            <div key={cat.id} className="mb-3">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: '#C9A84C' }}>{cat.label}</p>
              {selectedIds.map(id => {
                const item = cat.items.find(i => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between">
                    <span className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>{item.name}</span>
                    {item.price > 0 && <span className="font-sans text-[10px]" style={{ color: '#C9A84C' }}>+${item.price}pp</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
        {Object.values(sel.reception).every(a => a.length === 0) && <EmptyState />}
      </ReviewSection>

      {/* Meal Inclusions */}
      <ReviewSection title="Meal Inclusions">
        {sel.mealInclusions.mimosaBar && <p className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>Mimosa Bar — +$20pp</p>}
        {sel.mealInclusions.bloodyMaryBar && <p className="font-serif text-[13px]" style={{ color: '#1A1A1A' }}>Bloody Mary Bar — +$20pp</p>}
        {!sel.mealInclusions.mimosaBar && !sel.mealInclusions.bloodyMaryBar && <EmptyState />}
      </ReviewSection>

      {/* Notes */}
      {(sel.desserts.notes || sel.barPackage.notes || sel.rehearsalDinner.customThemeNote) && (
        <ReviewSection title="Notes">
          {sel.rehearsalDinner.customThemeNote && <p className="font-serif text-[12px] italic" style={{ color: '#6B6B6B' }}>Rehearsal: {sel.rehearsalDinner.customThemeNote}</p>}
          {sel.desserts.notes && <p className="font-serif text-[12px] italic" style={{ color: '#6B6B6B' }}>Desserts: {sel.desserts.notes}</p>}
          {sel.barPackage.notes && <p className="font-serif text-[12px] italic" style={{ color: '#6B6B6B' }}>Bar: {sel.barPackage.notes}</p>}
        </ReviewSection>
      )}

      {/* Totals */}
      <div className="rounded-xl border p-6 mt-6" style={{ background: '#FFFFFF', borderColor: '#E8E2D9' }}>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Base Reception Package</span>
            <span className="font-sans text-[12px] font-medium">${total.basePackage}pp</span>
          </div>
          {total.rehearsalDinnerCost > 0 && (
            <div className="flex justify-between">
              <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Rehearsal Dinner</span>
              <span className="font-sans text-[12px] font-medium" style={{ color: '#C9A84C' }}>${total.rehearsalDinnerCost}pp</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-sans text-[12px]" style={{ color: '#1A1A1A' }}>Total Upcharges</span>
            <span className="font-sans text-[12px] font-medium" style={{ color: '#C9A84C' }}>+${total.totalUpcharges}pp</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: '#E8E2D9' }}>
            <span className="font-sans text-[13px] font-semibold" style={{ color: '#2C3E2D' }}>Estimated Per Person</span>
            <span className="font-serif text-xl font-light" style={{ color: '#2C3E2D' }}>${total.estimatedPerPerson}pp</span>
          </div>
          {guestCount && (
            <div className="flex justify-between">
              <span className="font-sans text-[11px]" style={{ color: '#6B6B6B' }}>Estimated Total ({guestCount} guests)</span>
              <span className="font-sans text-[13px] font-semibold" style={{ color: '#2C3E2D' }}>${(total.estimatedPerPerson * guestCount).toLocaleString()}</span>
            </div>
          )}
        </div>
        <p className="font-serif italic text-[11px] mt-4" style={{ color: '#6B6B6B' }}>
          Final pricing confirmed with your coordinator.{guestCount ? ` Guest count used for estimate: ${guestCount}.` : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Button onClick={onSaveDraft} variant="outline" disabled={saving}
          className="font-sans text-xs tracking-[0.15em] uppercase border-[#E8E2D9]">
          Save Draft
        </Button>
        <Button onClick={() => setConfirmOpen(true)} disabled={saving}
          className="font-sans text-xs tracking-[0.15em] uppercase flex-1"
          style={{ background: '#2C3E2D', color: '#FAF8F4' }}>
          <Check size={14} className="mr-1.5" />
          {status === 'submitted' ? 'Update & Resubmit' : 'Submit Menu Selections'}
        </Button>
      </div>

      {status === 'submitted' && (
        <div className="flex items-center gap-2 mt-3 px-1">
          <AlertCircle size={12} style={{ color: '#C9A84C' }} />
          <p className="font-sans text-[10px] italic" style={{ color: '#C9A84C' }}>
            Previously submitted. Any changes will notify Brandon.
          </p>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl" style={{ color: '#2C3E2D' }}>Ready to submit?</AlertDialogTitle>
            <AlertDialogDescription className="font-serif text-sm" style={{ color: '#6B6B6B' }}>
              Once submitted, Brandon will be notified of any future changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-xs uppercase">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit} className="font-sans text-xs uppercase" style={{ background: '#2C3E2D' }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b" style={{ borderColor: '#E8E2D9' }}>
      <p className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: '#2C3E2D' }}>{title}</p>
      {children}
    </div>
  );
}

function EmptyState() {
  return <p className="font-serif italic text-[12px]" style={{ color: '#6B6B6B' }}>Nothing selected yet. Take your time.</p>;
}
