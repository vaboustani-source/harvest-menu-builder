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
};

export function CoupleSelectionsViewer({ coupleId, coupleName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: selections, isLoading } = useCoupleSelections(expanded ? coupleId : null);
  const { data: sections } = useMenuData();
  const { data: groupLimits } = useGroupLimits();

  const selectionCount = selections?.length ?? 0;

  // Group selections by section → group_label
  const grouped = (() => {
    if (!selections || !sections) return [];
    return sections
      .map((sec) => {
        const sectionSelections = selections.filter((s) => s.section_id === sec.id);
        if (sectionSelections.length === 0) return null;

        // Group by group_label
        const byGroup = new Map<string, CoupleSelection[]>();
        sectionSelections.forEach((sel) => {
          const key = sel.group_label || '_ungrouped';
          if (!byGroup.has(key)) byGroup.set(key, []);
          byGroup.get(key)!.push(sel);
        });

        return {
          section: sec,
          groups: Array.from(byGroup.entries()).map(([label, sels]) => {
            const limit = groupLimits?.find(
              (gl) => gl.section_id === sec.id && gl.group_label === label
            );
            return {
              label: label === '_ungrouped' ? null : label,
              selections: sels,
              includedCount: limit?.included_count ?? sels.length,
              extraPriceNote: limit?.extra_price_note ?? null,
            };
          }),
        };
      })
      .filter(Boolean) as Array<{
      section: (typeof sections)[0];
      groups: Array<{
        label: string | null;
        selections: CoupleSelection[];
        includedCount: number;
        extraPriceNote: string | null;
      }>;
    }>;
  })();

  const getItemName = (menuItemId: string) => {
    if (!sections) return menuItemId;
    for (const sec of sections) {
      const item = sec.items.find((i) => i.id === menuItemId);
      if (item) return item.name;
    }
    return 'Unknown item';
  };

  const handleExportPdf = () => {
    // Build a printable HTML document and trigger print
    const html = `
      <!DOCTYPE html>
      <html><head>
        <title>${coupleName} — Menu Selections</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #333; }
          h1 { font-size: 22px; font-style: italic; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
          h2 { font-size: 16px; margin-top: 24px; color: #3d4c3f; }
          h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 12px 0 6px; }
          ul { list-style: none; padding: 0; }
          li { padding: 4px 0; font-size: 14px; }
          .extra { color: #888; font-style: italic; }
          .divider { border-top: 1px dashed #ccc; margin: 8px 0; font-size: 11px; color: #999; }
          @media print { body { margin: 20px; } }
        </style>
      </head><body>
        <h1>${coupleName} — Menu Selections</h1>
        <p style="font-size:12px;color:#888;">Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        ${grouped.map((g) => `
          <h2>${g.section.emoji ? g.section.emoji + ' ' : ''}${g.section.section_title}</h2>
          ${g.groups.map((grp) => {
            const included = grp.selections.slice(0, grp.includedCount);
            const extras = grp.selections.slice(grp.includedCount);
            return `
              ${grp.label ? `<h3>${grp.label}</h3>` : ''}
              <ul>
                ${included.map((s) => `<li>${getItemName(s.menu_item_id)}${s.notes ? ` — <em>${s.notes}</em>` : ''}</li>`).join('')}
              </ul>
              ${extras.length > 0 ? `
                <div class="divider">${grp.includedCount} included · ${extras.length} extra${grp.extraPriceNote ? ` (${grp.extraPriceNote})` : ''}</div>
                <ul>${extras.map((s) => `<li class="extra">${getItemName(s.menu_item_id)}${s.notes ? ` — <em>${s.notes}</em>` : ''}</li>`).join('')}</ul>
              ` : ''}
            `;
          }).join('')}
        `).join('')}
        ${grouped.length === 0 ? '<p style="color:#999;margin-top:32px;">No selections yet.</p>' : ''}
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
          className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-muted-foreground hover:text-charcoal transition-colors"
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
        <div className="mt-3 pl-4 border-l-2 border-cream-dark">
          {isLoading ? (
            <p className="font-sans text-xs text-muted-foreground animate-pulse py-2">Loading selections…</p>
          ) : selectionCount === 0 ? (
            <p className="font-sans text-xs text-muted-foreground py-2 italic">No selections yet</p>
          ) : (
            <div className="space-y-4">
              {grouped.map((g) => (
                <div key={g.section.id}>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-sage font-medium mb-1">
                    {g.section.emoji && <span className="mr-1">{g.section.emoji}</span>}
                    {g.section.section_title}
                  </p>
                  {g.groups.map((grp, gi) => {
                    const included = grp.selections.slice(0, grp.includedCount);
                    const extras = grp.selections.slice(grp.includedCount);
                    return (
                      <div key={gi} className="mb-2">
                        {grp.label && (
                          <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{grp.label}</p>
                        )}
                        <ul className="space-y-0.5">
                          {included.map((sel) => (
                            <li key={sel.id} className="font-sans text-xs text-charcoal">
                              {getItemName(sel.menu_item_id)}
                              {sel.notes && <span className="text-muted-foreground ml-1">— {sel.notes}</span>}
                            </li>
                          ))}
                        </ul>
                        {extras.length > 0 && (
                          <>
                            <div className="flex items-center gap-2 my-1">
                              <div className="flex-1 h-px border-t border-dashed border-cream-dark" />
                              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">
                                {grp.includedCount} included · {extras.length} extra
                                {grp.extraPriceNote && ` (${grp.extraPriceNote})`}
                              </span>
                              <div className="flex-1 h-px border-t border-dashed border-cream-dark" />
                            </div>
                            <ul className="space-y-0.5">
                              {extras.map((sel) => (
                                <li key={sel.id} className="font-sans text-xs text-muted-foreground italic">
                                  {getItemName(sel.menu_item_id)}
                                  {sel.notes && <span className="ml-1">— {sel.notes}</span>}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
