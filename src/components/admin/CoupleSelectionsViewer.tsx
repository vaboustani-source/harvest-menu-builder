import { useState } from 'react';
import { useCoupleSelections, type CoupleSelection } from '@/hooks/useCoupleSelections';
import { useMenuData } from '@/hooks/useMenuData';
import { useGroupLimits } from '@/hooks/useGroupLimits';
import { ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  coupleId: string;
  coupleName: string;
  guestCount?: number | null;
};

type GroupedSection = {
  section: { id: string; emoji: string | null; section_title: string; base_price_pp: number | null };
  totalItems: number;
  groups: Array<{
    label: string | null;
    selections: CoupleSelection[];
    includedCount: number;
    extraPriceNote: string | null;
    extraPricePp: number | null;
  }>;
};

export function CoupleSelectionsViewer({ coupleId, coupleName, guestCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: selections, isLoading } = useCoupleSelections(expanded ? coupleId : null);
  const { data: sections } = useMenuData();
  const { data: groupLimits } = useGroupLimits();

  const selectionCount = selections?.length ?? 0;

  const grouped: GroupedSection[] = (() => {
    if (!selections || !sections) return [];
    return sections
      .map((sec) => {
        const sectionSelections = selections.filter((s) => s.section_id === sec.id);
        if (sectionSelections.length === 0) return null;

        const byGroup = new Map<string, CoupleSelection[]>();
        sectionSelections.forEach((sel) => {
          const key = sel.group_label || '_ungrouped';
          if (!byGroup.has(key)) byGroup.set(key, []);
          byGroup.get(key)!.push(sel);
        });

        return {
          section: { id: sec.id, emoji: sec.emoji, section_title: sec.section_title, base_price_pp: sec.base_price_pp ?? null },
          totalItems: sectionSelections.length,
          groups: Array.from(byGroup.entries()).map(([label, sels]) => {
            const limit = groupLimits?.find(
              (gl) => gl.section_id === sec.id && gl.group_label === label
            );
            return {
              label: label === '_ungrouped' ? null : label,
              selections: sels,
              includedCount: limit?.included_count ?? sels.length,
              extraPriceNote: limit?.extra_price_note ?? null,
              extraPricePp: limit?.extra_price_pp ?? null,
            };
          }),
        };
      })
      .filter(Boolean) as GroupedSection[];
  })();

  const getItemName = (menuItemId: string) => {
    if (!sections) return menuItemId;
    for (const sec of sections) {
      const item = sec.items.find((i) => i.id === menuItemId);
      if (item) return item.name;
    }
    return 'Unknown item';
  };

  // Pricing calculations
  const sectionPricing = grouped.map((g) => {
    const basePp = g.section.base_price_pp ?? 0;
    const extraLines: { group: string; count: number; unitPrice: number; subtotal: number }[] = [];
    g.groups.forEach((grp) => {
      const extraCount = Math.max(0, grp.selections.length - grp.includedCount);
      if (extraCount > 0 && grp.extraPricePp) {
        extraLines.push({
          group: grp.label ?? 'Items',
          count: extraCount,
          unitPrice: grp.extraPricePp,
          subtotal: extraCount * grp.extraPricePp,
        });
      }
    });
    const extrasTotal = extraLines.reduce((sum, l) => sum + l.subtotal, 0);
    return { sectionTitle: `${g.section.emoji ? g.section.emoji + ' ' : ''}${g.section.section_title}`, basePp, extraLines, extrasTotal, sectionTotal: basePp + extrasTotal };
  });

  const grandTotalPp = sectionPricing.reduce((sum, s) => sum + s.sectionTotal, 0);
  const eventTotal = guestCount ? grandTotalPp * guestCount : null;

  const handleExportPdf = () => {
    const html = `
      <!DOCTYPE html>
      <html><head>
        <title>${coupleName} — Menu Selections</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #333; }
          h1 { font-size: 22px; font-style: italic; border-bottom: 2px solid #3d4c3f; padding-bottom: 8px; color: #3d4c3f; }
          .meta { font-size: 12px; color: #888; margin-bottom: 32px; }
          .section-block { margin-bottom: 28px; }
          .section-divider { border-top: 2px solid #3d4c3f; margin-bottom: 0; }
          .section-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 6px; }
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; color: #3d4c3f; }
          .section-count { font-size: 11px; color: #888; }
          .group-block { margin: 8px 0 12px 12px; padding-left: 12px; border-left: 2px solid #d4c9a8; }
          .group-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; font-weight: 600; margin-bottom: 4px; }
          ul { list-style: none; padding: 0; margin: 0; }
          li { padding: 2px 0; font-size: 14px; }
          li::before { content: "· "; color: #aaa; }
          .extra { color: #888; font-style: italic; }
          .divider { font-size: 10px; color: #999; margin: 6px 0; padding: 2px 0; border-top: 1px dashed #ccc; }
          .pricing-block { margin-top: 32px; border-top: 2px solid #3d4c3f; padding-top: 16px; }
          .pricing-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; color: #3d4c3f; margin-bottom: 12px; }
          .pricing-section { margin-bottom: 12px; }
          .pricing-section-title { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
          .pricing-line { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; color: #555; }
          .pricing-line.extra-line { padding-left: 16px; font-style: italic; color: #888; }
          .pricing-line.subtotal { font-weight: 600; color: #333; border-top: 1px solid #ddd; padding-top: 4px; margin-top: 4px; }
          .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #3d4c3f; border-top: 2px solid #3d4c3f; padding-top: 8px; margin-top: 16px; }
          .event-total { display: flex; justify-content: space-between; font-size: 13px; color: #888; margin-top: 4px; }
          @media print { body { margin: 20px; } }
        </style>
      </head><body>
        <h1>${coupleName}</h1>
        <p class="meta">Menu Selections · Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${guestCount ? ` · ${guestCount} guests` : ''}</p>
        ${grouped.map((g) => `
          <div class="section-block">
            <div class="section-divider"></div>
            <div class="section-header">
              <span class="section-title">${g.section.emoji ? g.section.emoji + ' ' : ''}${g.section.section_title}</span>
              <span class="section-count">${g.totalItems} item${g.totalItems !== 1 ? 's' : ''}</span>
            </div>
            ${g.groups.map((grp) => {
              const included = grp.selections.slice(0, grp.includedCount);
              const extras = grp.selections.slice(grp.includedCount);
              return `
                <div class="group-block">
                  ${grp.label ? `<div class="group-label">${grp.label}</div>` : ''}
                  <ul>
                    ${included.map((s) => `<li>${getItemName(s.menu_item_id)}${s.notes ? ` — <em>${s.notes}</em>` : ''}</li>`).join('')}
                  </ul>
                  ${extras.length > 0 ? `
                    <div class="divider">${grp.includedCount} included · ${extras.length} extra${grp.extraPriceNote ? ` (${grp.extraPriceNote})` : ''}</div>
                    <ul>${extras.map((s) => `<li class="extra">${getItemName(s.menu_item_id)}${s.notes ? ` — <em>${s.notes}</em>` : ''}</li>`).join('')}</ul>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
        ${grouped.length === 0 ? '<p style="color:#999;margin-top:32px;">No selections yet.</p>' : ''}
        
        ${sectionPricing.length > 0 ? `
          <div class="pricing-block">
            <div class="pricing-title">Pricing Breakdown</div>
            ${sectionPricing.map((sp) => `
              <div class="pricing-section">
                <div class="pricing-section-title">${sp.sectionTitle}</div>
                ${sp.basePp > 0 ? `<div class="pricing-line"><span>Base package</span><span>$${sp.basePp.toFixed(2)}pp</span></div>` : ''}
                ${sp.extraLines.map((el) => `
                  <div class="pricing-line extra-line"><span>${el.count} extra ${el.group} × $${el.unitPrice.toFixed(2)}</span><span>$${el.subtotal.toFixed(2)}pp</span></div>
                `).join('')}
                <div class="pricing-line subtotal"><span>Section subtotal</span><span>$${sp.sectionTotal.toFixed(2)}pp</span></div>
              </div>
            `).join('')}
            <div class="grand-total"><span>Total per person</span><span>$${grandTotalPp.toFixed(2)}pp</span></div>
            ${eventTotal != null ? `<div class="event-total"><span>Event total (${guestCount} guests)</span><span>$${eventTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>` : ''}
          </div>
        ` : ''}
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.setTimeout(() => w.print(), 400);
    }
  };

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
        {expanded && selectionCount > 0 && (
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
          ) : selectionCount === 0 ? (
            <p className="font-sans text-xs text-muted-foreground py-2 italic">No selections yet</p>
          ) : (
            <div className="space-y-1">
              {grouped.map((g) => (
                <div key={g.section.id}>
                  <div className="border-t-2 border-primary/30 pt-2 pb-1 flex items-center justify-between">
                    <p className="font-sans text-xs uppercase tracking-[0.15em] font-bold text-primary">
                      {g.section.emoji && <span className="mr-1.5">{g.section.emoji}</span>}
                      {g.section.section_title}
                    </p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-sans">
                      {g.totalItems} item{g.totalItems !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {g.groups.map((grp, gi) => {
                    const included = grp.selections.slice(0, grp.includedCount);
                    const extras = grp.selections.slice(grp.includedCount);
                    return (
                      <div key={gi} className="ml-3 pl-3 border-l-2 border-accent mb-2">
                        {grp.label && (
                          <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mt-1 mb-0.5">
                            {grp.label}
                          </p>
                        )}
                        <ul className="space-y-0">
                          {included.map((sel) => (
                            <li key={sel.id} className="font-sans text-xs text-foreground flex items-start gap-1.5 py-0.5">
                              <span className="text-muted-foreground select-none">·</span>
                              <span>
                                {getItemName(sel.menu_item_id)}
                                {sel.notes && <span className="text-muted-foreground ml-1">— {sel.notes}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {extras.length > 0 && (
                          <>
                            <div className="flex items-center gap-2 my-1">
                              <div className="flex-1 h-px border-t border-dashed border-border" />
                              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                {grp.includedCount} included · {extras.length} extra
                                {grp.extraPriceNote && ` (${grp.extraPriceNote})`}
                              </span>
                              <div className="flex-1 h-px border-t border-dashed border-border" />
                            </div>
                            <ul className="space-y-0">
                              {extras.map((sel) => (
                                <li key={sel.id} className="font-sans text-xs text-muted-foreground italic flex items-start gap-1.5 py-0.5">
                                  <span className="select-none">·</span>
                                  <span>
                                    {getItemName(sel.menu_item_id)}
                                    {sel.notes && <span className="ml-1">— {sel.notes}</span>}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Pricing summary inline */}
              {sectionPricing.some(s => s.basePp > 0 || s.extraLines.length > 0) && (
                <div className="border-t-2 border-primary/30 pt-3 mt-2">
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] font-bold text-primary mb-2">Pricing Summary</p>
                  {sectionPricing.map((sp, i) => (
                    <div key={i} className="mb-2 ml-3 pl-3 border-l-2 border-accent">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{sp.sectionTitle}</p>
                      {sp.basePp > 0 && (
                        <div className="flex justify-between font-sans text-xs text-foreground">
                          <span>Base package</span><span>${sp.basePp.toFixed(2)}pp</span>
                        </div>
                      )}
                      {sp.extraLines.map((el, j) => (
                        <div key={j} className="flex justify-between font-sans text-xs text-muted-foreground italic pl-2">
                          <span>{el.count} extra {el.group} × ${el.unitPrice.toFixed(2)}</span><span>${el.subtotal.toFixed(2)}pp</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-sans text-xs font-semibold text-foreground border-t border-border mt-1 pt-1">
                        <span>Subtotal</span><span>${sp.sectionTotal.toFixed(2)}pp</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-sans text-sm font-bold text-primary border-t-2 border-primary/30 pt-2 mt-2">
                    <span>Total per person</span><span>${grandTotalPp.toFixed(2)}pp</span>
                  </div>
                  {eventTotal != null && (
                    <div className="flex justify-between font-sans text-xs text-muted-foreground mt-1">
                      <span>Event total ({guestCount} guests)</span><span>${eventTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
