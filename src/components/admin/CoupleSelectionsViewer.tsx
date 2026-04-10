import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BuilderSelections, defaultSelections, calculateTotal,
  rehearsalThemes, welcomeOptions, spritzerOptions,
  cocktailHourItems, receptionCategories, COCKTAIL_INCLUDED_COUNT, barAddOnItems,
} from '@/data/builderMenuData';
import { usePricingData } from '@/hooks/usePricingConfig';

type Props = {
  coupleId: string;
  coupleName: string;
  guestCount?: number | null;
  weddingDate?: string | null;
};

function useBuilderSelections(coupleId: string | null) {
  return useQuery({
    queryKey: ['builder-selections-admin', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('builder_selections')
        .select('*')
        .eq('couple_id', coupleId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const saved = (data.selections || {}) as any;
      const merged: BuilderSelections = {
        ...defaultSelections,
        ...saved,
        rehearsalDinner: { ...defaultSelections.rehearsalDinner, ...saved.rehearsalDinner },
        welcomeHour: { ...defaultSelections.welcomeHour, ...saved.welcomeHour },
        cocktailHour: Array.isArray(saved.cocktailHour) ? saved.cocktailHour : defaultSelections.cocktailHour,
        reception: {
          salads: Array.isArray(saved.reception?.salads) ? saved.reception.salads : defaultSelections.reception.salads,
          pastasGrains: Array.isArray(saved.reception?.pastasGrains) ? saved.reception.pastasGrains : defaultSelections.reception.pastasGrains,
          proteins: Array.isArray(saved.reception?.proteins) ? saved.reception.proteins : defaultSelections.reception.proteins,
          vegetablesStarches: Array.isArray(saved.reception?.vegetablesStarches) ? saved.reception.vegetablesStarches : defaultSelections.reception.vegetablesStarches,
        },
        mealInclusions: { ...defaultSelections.mealInclusions, ...saved.mealInclusions },
        desserts: { ...defaultSelections.desserts, ...saved.desserts },
        barPackage: { ...defaultSelections.barPackage, ...saved.barPackage, selectedAddOns: Array.isArray(saved.barPackage?.selectedAddOns) ? saved.barPackage.selectedAddOns : defaultSelections.barPackage.selectedAddOns },
        stepNotes: { ...defaultSelections.stepNotes, ...saved.stepNotes },
      };
      return merged;
    },
  });
}

// ─── Section Data Builders ────────────────────────────────────────────────

interface PdfSection {
  title: string;
  items: { name: string; upcharge: number | null; note?: string }[];
  notes: string;
  subtotal: number;
}

function buildPdfSections(sel: BuilderSelections, pricing: ReturnType<typeof usePricingData>): PdfSection[] {
  const sections: PdfSection[] = [];
  const total = calculateTotal(sel, pricing);

  // Rehearsal Dinner
  if (sel.rehearsalDinner.themeId) {
    const theme = rehearsalThemes.find(t => t.id === sel.rehearsalDinner.themeId);
    if (theme) {
      const items: PdfSection['items'] = [{ name: theme.name, upcharge: null }];
      let sub = total.rehearsalDinnerCost;
      if (sel.rehearsalDinner.addOnSelected && theme.addOn) {
        const addonLine = total.lineItems.find(l => l.section === 'Rehearsal Dinner');
        items.push({ name: theme.addOn.name, upcharge: addonLine?.amount ?? theme.addOn.price });
      }
      sections.push({ title: 'Rehearsal Dinner', items, notes: sel.stepNotes.rehearsalDinner, subtotal: sub + total.lineItems.filter(l => l.section === 'Rehearsal Dinner').reduce((s, l) => s + l.amount, 0) });
    }
  }

  // Welcome Hour
  {
    const items: PdfSection['items'] = [];
    sel.welcomeHour.nonAlcoholic.forEach(id => {
      const opt = welcomeOptions.find(o => o.id === id);
      if (opt) items.push({ name: opt.name, upcharge: null });
    });
    sel.welcomeHour.spritzers.forEach(id => {
      const opt = spritzerOptions.find(o => o.id === id);
      if (opt) items.push({ name: opt.name, upcharge: null });
    });
    if (sel.welcomeHour.passedServiceUpgrade) items.push({ name: 'Passed Service Upgrade', upcharge: pricing.getPrice('passed_service_upgrade') ?? 8 });
    if (sel.welcomeHour.champagneUpgrade) items.push({ name: 'Champagne Welcome Station', upcharge: pricing.getPrice('champagne_upgrade') ?? 5 });
    const welcomeUpcharges = total.lineItems.filter(l => l.section === 'Welcome Hour').reduce((s, l) => s + l.amount, 0);
    if (items.length > 0) {
      sections.push({ title: 'Welcome Hour', items, notes: sel.stepNotes.welcomeHour, subtotal: welcomeUpcharges });
    }
  }

  // Cocktail Hour
  {
    const cocktailIncluded = pricing.getIncludedCount('cocktail_included_count') ?? COCKTAIL_INCLUDED_COUNT;
    const cocktailBaseValue = pricing.getPrice('cocktail_base_value') ?? 6;
    const items: PdfSection['items'] = [];
    sel.cocktailHour.forEach((id, idx) => {
      const item = cocktailHourItems.find(i => i.id === id);
      if (!item) return;
      const itemPrice = pricing.getPrice(id) ?? item.price;
      let upcharge: number | null = null;
      if (idx < cocktailIncluded) {
        const premium = Math.max(0, itemPrice - cocktailBaseValue);
        if (premium > 0) upcharge = premium;
      } else {
        upcharge = itemPrice;
      }
      items.push({ name: item.name, upcharge });
    });
    const cocktailUpcharges = total.lineItems.filter(l => l.section === 'Cocktail Hour').reduce((s, l) => s + l.amount, 0);
    if (items.length > 0) {
      sections.push({ title: 'Cocktail Hour', items, notes: sel.stepNotes.cocktailHour, subtotal: cocktailUpcharges });
    }
  }

  // Reception Dinner
  {
    const items: PdfSection['items'] = [];
    const catKeyMap: Record<string, keyof typeof sel.reception> = {
      salads: 'salads', 'pastas-grains': 'pastasGrains', proteins: 'proteins', 'vegetables-starches': 'vegetablesStarches',
    };
    for (const cat of receptionCategories) {
      const key = catKeyMap[cat.id];
      const selectedIds = sel.reception[key];
      const pKeys: Record<string, { included: string; extra: string }> = {
        salads: { included: 'salads_included', extra: 'salads_extra_pp' },
        'pastas-grains': { included: 'pastas_included', extra: 'pastas_extra_pp' },
        proteins: { included: 'proteins_included', extra: 'proteins_extra_pp' },
        'vegetables-starches': { included: 'sides_included', extra: 'sides_extra_pp' },
      };
      const pk = pKeys[cat.id];
      const includedCount = pricing.getIncludedCount(pk.included) ?? cat.included;
      const extraCharge = pricing.getPrice(pk.extra) ?? cat.extraPrice;

      selectedIds.forEach((id, idx) => {
        const item = cat.items.find(i => i.id === id);
        if (!item) return;
        const premium = pricing.getPrice(id) ?? item.price;
        let upcharge: number | null = null;
        if (idx < includedCount) {
          if (premium > 0) upcharge = premium;
        } else {
          upcharge = extraCharge + premium;
        }
        items.push({ name: item.name, upcharge, note: cat.label });
      });
    }
    const receptionUpcharges = total.lineItems.filter(l => l.section === 'Reception').reduce((s, l) => s + l.amount, 0);
    if (items.length > 0) {
      sections.push({ title: 'Reception Dinner', items, notes: sel.stepNotes.receptionDinner, subtotal: receptionUpcharges });
    }
  }

  // Meal Inclusions
  {
    const items: PdfSection['items'] = [];
    if (sel.mealInclusions.mimosaBar) items.push({ name: 'Mimosa Bar', upcharge: pricing.getPrice('mimosa_bar') ?? 20 });
    if (sel.mealInclusions.bloodyMaryBar) items.push({ name: 'Bloody Mary Bar', upcharge: pricing.getPrice('bloody_mary_bar') ?? 20 });
    if (sel.mealInclusions.farewellBrunch) items.push({ name: 'Upgrade to Farewell Brunch', upcharge: pricing.getPrice('farewell_brunch') ?? 25 });
    const inclUpcharges = total.lineItems.filter(l => l.section === 'Meal Inclusions').reduce((s, l) => s + l.amount, 0);
    if (items.length > 0) {
      sections.push({ title: 'Meal Inclusions', items, notes: sel.stepNotes.mealInclusions, subtotal: inclUpcharges });
    }
  }

  // Desserts
  if (sel.desserts.notes) {
    sections.push({ title: 'Desserts', items: [{ name: sel.desserts.notes, upcharge: null }], notes: sel.stepNotes.desserts, subtotal: 0 });
  }

  // Bar Package
  const barItems: { name: string; upcharge: number | null; note?: string }[] = [];
  for (const id of (sel.barPackage.selectedAddOns ?? [])) {
    const item = barAddOnItems.find(a => a.id === id);
    if (item) barItems.push({ name: item.name, upcharge: item.price > 0 ? item.price : null });
  }
  if (sel.barPackage.notes) {
    barItems.push({ name: `Notes: ${sel.barPackage.notes}`, upcharge: null });
  }
  if (barItems.length > 0) {
    sections.push({ title: 'Bar Package', items: barItems, notes: sel.stepNotes.barPackage, subtotal: 0 });
  }

  return sections;
}

// ─── PDF HTML Generator ───────────────────────────────────────────────────

function generatePdfHtml(
  coupleName: string,
  weddingDate: string | null,
  guestCount: number | null,
  pdfSections: PdfSection[],
  total: ReturnType<typeof calculateTotal>,
) {
  const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const weddingStr = weddingDate ? new Date(weddingDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const metaParts = [weddingStr, guestCount ? `${guestCount} guests` : null, `Generated ${generatedDate}`].filter(Boolean).join(' · ');
  const grandTotal = guestCount ? total.estimatedPerPerson * guestCount : null;

  const sectionsHtml = pdfSections.map(sec => `
    <div class="section">
      <div class="section-title">${sec.title}</div>
      <div class="items">
        ${sec.items.map(item => `
          <div class="item-row">
            <span class="item-name">· ${item.name}</span>
            ${item.upcharge != null ? `<span class="item-upcharge">+$${item.upcharge}pp</span>` : ''}
          </div>
        `).join('')}
      </div>
      ${sec.notes ? `<div class="section-notes">${sec.notes}</div>` : ''}
      ${sec.subtotal > 0 ? `<div class="section-subtotal">Section upcharges: +$${sec.subtotal.toFixed(2)}pp</div>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head>
<title>${coupleName} — Harvest 336 Menu Selections</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Jost', sans-serif; max-width: 700px; margin: 0 auto; padding: 48px 40px; color: #1A1A1A; background: #FFFFFF; }
  .header { text-align: center; margin-bottom: 32px; }
  .farm-name { font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #2C3E2D; font-weight: 500; margin-bottom: 8px; }
  .couple-name { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #2C3E2D; margin-bottom: 6px; }
  .subtitle { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-style: italic; color: #C9A84C; margin-bottom: 10px; }
  .meta { font-family: 'Jost', sans-serif; font-size: 11px; color: #6B6B6B; margin-bottom: 16px; }
  .divider { border: none; border-top: 1px solid #E8E2D9; margin: 0 0 28px; }
  .section { margin-bottom: 24px; }
  .section-title { font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #2C3E2D; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #E8E2D9; }
  .items { margin-bottom: 8px; }
  .item-row { display: flex; justify-content: space-between; align-items: baseline; padding: 3px 0; font-family: 'Cormorant Garamond', serif; font-size: 14px; }
  .item-name { color: #1A1A1A; flex: 1; }
  .item-upcharge { font-family: 'Jost', sans-serif; font-size: 11px; color: #C9A84C; margin-left: 16px; white-space: nowrap; }
  .section-notes { font-family: 'Cormorant Garamond', serif; font-size: 12px; font-style: italic; color: #6B6B6B; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #E8E2D9; }
  .section-subtotal { font-family: 'Jost', sans-serif; font-size: 11px; color: #C9A84C; text-align: right; margin-top: 8px; font-weight: 500; }
  .pricing { margin-top: 32px; padding-top: 20px; border-top: 2px solid #2C3E2D; }
  .pricing-title { font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #2C3E2D; font-weight: 600; margin-bottom: 14px; }
  .pricing-line { display: flex; justify-content: space-between; font-family: 'Jost', sans-serif; font-size: 12px; padding: 3px 0; color: #1A1A1A; }
  .pricing-line.upcharge { color: #C9A84C; padding-left: 12px; font-size: 11px; }
  .pricing-line.total-upcharges { border-top: 1px solid #E8E2D9; padding-top: 6px; margin-top: 6px; }
  .pricing-line.grand { font-size: 16px; font-weight: 600; color: #2C3E2D; border-top: 2px solid #2C3E2D; padding-top: 10px; margin-top: 10px; }
  .pricing-line.grand-total { font-size: 13px; font-weight: 600; color: #2C3E2D; margin-top: 4px; }
  .pricing-note { font-family: 'Cormorant Garamond', serif; font-size: 12px; font-style: italic; color: #6B6B6B; margin-top: 16px; text-align: center; }
  .footer { font-family: 'Jost', sans-serif; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #A0A0A0; text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #E8E2D9; }
  @media print { body { margin: 20px; padding: 32px 24px; } .footer { position: fixed; bottom: 20px; left: 0; right: 0; } }
</style>
</head><body>
  <div class="header">
    <div class="farm-name">Gilbertsville Farmhouse</div>
    <div class="couple-name">${coupleName}</div>
    <div class="subtitle">Harvest 336 Menu Selections</div>
    <div class="meta">${metaParts}</div>
  </div>
  <hr class="divider" />
  ${sectionsHtml}
  ${pdfSections.length === 0 ? '<p style="color:#6B6B6B;font-style:italic;text-align:center;margin:32px 0;">No selections yet.</p>' : ''}
  ${pdfSections.length > 0 ? `
  <div class="pricing">
    <div class="pricing-title">Pricing Breakdown</div>
    <div class="pricing-line"><span>Base Reception Package</span><span>$${total.basePackage}pp</span></div>
    ${total.rehearsalDinnerCost > 0 ? `<div class="pricing-line"><span>Rehearsal Dinner</span><span>$${total.rehearsalDinnerCost}pp</span></div>` : ''}
    ${total.lineItems.map(li => `<div class="pricing-line upcharge"><span>${li.label}</span><span>+$${li.amount}pp</span></div>`).join('')}
    <div class="pricing-line total-upcharges"><span>Total Upcharges</span><span>+$${total.totalUpcharges}pp</span></div>
    <div class="pricing-line grand"><span>Estimated Per Person</span><span>$${total.estimatedPerPerson}pp</span></div>
    ${grandTotal != null ? `<div class="pricing-line grand-total"><span>Est. Grand Total (${guestCount} guests)</span><span>$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></div>` : ''}
  </div>
  <p class="pricing-note">Final pricing confirmed with your coordinator.</p>
  ` : ''}
  <div class="footer">Gilbertsville Farmhouse · Harvest 336 Culinary Program · South New Berlin, NY</div>
</body></html>`;
}

// ─── Component ────────────────────────────────────────────────────────────

export function CoupleSelectionsViewer({ coupleId, coupleName, guestCount, weddingDate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: selections, isLoading } = useBuilderSelections(expanded ? coupleId : null);
  const pricing = usePricingData();

  const hasSelections = selections && (
    selections.rehearsalDinner.themeId ||
    selections.welcomeHour.nonAlcoholic.length > 0 ||
    selections.welcomeHour.spritzers.length > 0 ||
    selections.cocktailHour.length > 0 ||
    Object.values(selections.reception).some(a => a.length > 0) ||
    selections.mealInclusions.mimosaBar ||
    selections.mealInclusions.bloodyMaryBar ||
    selections.mealInclusions.farewellBrunch ||
    selections.desserts.notes ||
    selections.barPackage.notes ||
    (selections.barPackage.selectedAddOns?.length > 0)
  );

  const handleExportPdf = () => {
    if (!selections) return;
    const pdfSections = buildPdfSections(selections, pricing);
    const total = calculateTotal(selections, pricing);
    const html = generatePdfHtml(coupleName, weddingDate ?? null, guestCount ?? null, pdfSections, total);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.setTimeout(() => w.print(), 500);
    }
  };

  // Inline preview data
  const pdfSections = selections ? buildPdfSections(selections, pricing) : [];
  const total = selections ? calculateTotal(selections, pricing) : null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Hide' : 'View'} Selections
        </button>
        {expanded && hasSelections && (
          <Button
            onClick={handleExportPdf}
            size="sm"
            variant="outline"
            className="h-6 px-2 font-sans text-[10px] uppercase tracking-widest gap-1 border border-primary bg-primary-foreground text-primary"
          >
            <FileText size={10} /> Export PDF
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          {isLoading ? (
            <p className="font-sans text-xs text-muted-foreground animate-pulse py-2">Loading selections…</p>
          ) : !hasSelections ? (
            <p className="font-sans text-xs text-muted-foreground py-2 italic">No selections yet</p>
          ) : (
            <div className="space-y-1">
              {pdfSections.map((sec, i) => (
                <div key={i}>
                  <div className="border-t-2 border-primary/30 pt-2 pb-1 flex items-center justify-between">
                    <p className="font-sans text-xs uppercase tracking-[0.15em] font-bold text-primary">{sec.title}</p>
                    <span className="font-sans text-[9px] px-1.5 py-0 h-4 text-muted-foreground">
                      {sec.items.length} item{sec.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ml-3 pl-3 border-l-2 border-accent mb-2">
                    {sec.items.map((item, j) => (
                      <div key={j} className="flex justify-between items-baseline py-0.5">
                        <span className="font-sans text-xs text-foreground">
                          <span className="text-muted-foreground select-none mr-1.5">·</span>
                          {item.name}
                        </span>
                        {item.upcharge != null && (
                          <span className="font-sans text-[10px] ml-2 whitespace-nowrap" style={{ color: '#C9A84C' }}>+${item.upcharge}pp</span>
                        )}
                      </div>
                    ))}
                    {sec.notes && (
                      <p className="font-serif text-[11px] italic text-muted-foreground mt-1 pt-1 border-t border-dashed border-border">
                        {sec.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Pricing summary */}
              {total && (
                <div className="border-t-2 border-primary/30 pt-3 mt-2">
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] font-bold text-primary mb-2">Pricing Summary</p>
                  <div className="ml-3 pl-3 border-l-2 border-accent space-y-1">
                    <div className="flex justify-between font-sans text-xs">
                      <span>Base Reception Package</span><span>${total.basePackage}pp</span>
                    </div>
                    {total.rehearsalDinnerCost > 0 && (
                      <div className="flex justify-between font-sans text-xs">
                        <span>Rehearsal Dinner</span><span>${total.rehearsalDinnerCost}pp</span>
                      </div>
                    )}
                    <div className="flex justify-between font-sans text-xs" style={{ color: '#C9A84C' }}>
                      <span>Total Upcharges</span><span>+${total.totalUpcharges}pp</span>
                    </div>
                    <div className="flex justify-between font-sans text-sm font-bold text-primary border-t-2 border-primary/30 pt-2 mt-2">
                      <span>Estimated Per Person</span><span>${total.estimatedPerPerson}pp</span>
                    </div>
                    {guestCount ? (
                      <div className="flex justify-between font-sans text-xs text-muted-foreground mt-1">
                        <span>Est. Total ({guestCount} guests)</span>
                        <span>${(total.estimatedPerPerson * guestCount).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
