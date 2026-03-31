import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Star, Check, X } from 'lucide-react';
import { DietTagBadge } from './DietTag';
import type { DbMenuPackage } from '@/hooks/useMenuData';
import type { DietTag } from '@/data/menuData';

const SEASON_CONFIG: Record<string, { label: string; color: string }> = {
  spring: { label: 'SPR', color: '#7BA05B' },
  summer: { label: 'SUM', color: '#D4883A' },
  fall:   { label: 'FALL', color: '#A0522D' },
  winter: { label: 'WIN', color: '#4A7C9B' },
};

function SeasonBadge({ season }: { season: string }) {
  const cfg = SEASON_CONFIG[season];
  if (!cfg) return null;
  return (
    <span
      style={{ color: cfg.color, borderColor: cfg.color }}
      className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
    >
      {cfg.label}
    </span>
  );
}

function YearRoundBadge() {
  return (
    <span className="inline-block border border-charcoal/30 text-charcoal/60 rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none">
      YR
    </span>
  );
}

type FilterType = 'all' | 'year-round' | 'summer' | 'fall' | 'under-70' | 'under-85';

function parsePrice(price: string): number {
  const match = price.match(/\$(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parsePackageContent(description: string) {
  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);
  const dishes: string[] = [];
  const addOns: { name: string; price: string }[] = [];
  let teaser = '';

  for (const line of lines) {
    const addOnMatch = line.match(/^ADD-ON:\s*(.+?)\s*[—–-]\s*(.+)$/i);
    if (addOnMatch) {
      addOns.push({ name: addOnMatch[1].trim(), price: addOnMatch[2].trim() });
    } else {
      dishes.push(line);
      if (!teaser) teaser = line;
    }
  }

  return { dishes, addOns, teaser };
}

interface Props {
  packages: DbMenuPackage[];
}

export function RehearsalDinnerSection({ packages }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    return packages.filter(pkg => {
      const price = parsePrice(pkg.price);
      const isYearRound = !pkg.season || pkg.season.length === 0;
      switch (activeFilter) {
        case 'year-round': return isYearRound;
        case 'summer': return pkg.season?.includes('summer');
        case 'fall': return pkg.season?.includes('fall');
        case 'under-70': return price < 70;
        case 'under-85': return price < 85;
        default: return true;
      }
    });
  }, [packages, activeFilter]);

  const comparePackages = packages.filter(p => compareIds.has(p.id));

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'year-round', label: 'Year-Round' },
    { id: 'summer', label: 'Summer' },
    { id: 'fall', label: 'Fall' },
    { id: 'under-70', label: 'Under $70pp' },
    { id: 'under-85', label: 'Under $85pp' },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-[10px] flex-wrap mb-8">
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted-brand mr-1">
          Filter:
        </span>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-[13px] py-[5px] rounded-full border font-sans text-[11px] transition-all duration-150 cursor-pointer ${
              activeFilter === f.id
                ? 'bg-warm border-warm text-white'
                : 'bg-white border-[#D5CFC8] text-text-muted-brand hover:border-warm hover:text-warm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Compare bar */}
      {compareIds.size > 0 && (
        <div className="mb-6 rounded-[10px] border border-warm/30 bg-warm/[0.04] px-5 py-3 flex items-center justify-between">
          <span className="font-sans text-[11px] text-charcoal">
            <span className="font-medium">{compareIds.size}</span> package{compareIds.size > 1 ? 's' : ''} selected for comparison
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareIds(new Set())}
              className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-muted-brand hover:text-charcoal cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {filtered.map(pkg => {
          const { dishes, addOns, teaser } = parsePackageContent(pkg.description);
          const isExpanded = expandedIds.has(pkg.id);
          const isComparing = compareIds.has(pkg.id);
          const isYearRound = !pkg.season || pkg.season.length === 0;
          const dietTags = (pkg.dietary_tags ?? []) as DietTag[];

          return (
            <div
              key={pkg.id}
              className="rounded-[10px] border px-6 py-5 transition-all duration-200 relative"
              style={{
                background: '#F5F2EC',
                borderColor: isComparing ? '#C8A96E' : '#D5CFC8',
                borderWidth: isComparing ? '2px' : '1px',
              }}
            >
              {/* Featured badge */}
              {pkg.is_featured && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-warm/10 border border-warm/30 rounded-full px-2 py-0.5">
                    <Star size={10} className="text-warm fill-warm" />
                    <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-warm font-semibold">Chef's Pick</span>
                  </span>
                </div>
              )}

              {/* Season badges — top right */}
              <div className="absolute top-3 right-3 flex gap-1">
                {isYearRound ? (
                  <YearRoundBadge />
                ) : (
                  pkg.season?.map(s => <SeasonBadge key={s} season={s} />)
                )}
              </div>

              {/* Header row */}
              <div className="flex items-start justify-between gap-4 pr-16">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {pkg.is_featured && <div className="w-0 md:w-4" />}
                    <p className="font-serif text-[16px] font-medium text-[#2C2C2C] leading-tight">
                      {pkg.title}
                    </p>
                  </div>
                  {/* Dietary tags */}
                  {dietTags.length > 0 && (
                    <div className="flex gap-[5px] mt-1.5 ml-0">
                      {dietTags.map(tag => (
                        <DietTagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                  {/* Teaser when collapsed */}
                  {!isExpanded && teaser && (
                    <p className="font-serif text-[12.5px] italic text-[#2C2C2C]/60 mt-1.5 line-clamp-1">
                      {teaser}
                    </p>
                  )}
                </div>
                <p className="font-serif text-[28px] font-light text-warm leading-none shrink-0 mt-1">
                  {pkg.price}
                </p>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#D5CFC8]">
                  <ul className="space-y-1.5">
                    {dishes.map((dish, i) => (
                      <li key={i} className="flex items-start gap-2 font-serif text-[13px] text-[#2C2C2C]/80 leading-[1.55]">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-sage shrink-0" />
                        <span>{dish}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Add-ons callout */}
                  {addOns.length > 0 && (
                    <div className="mt-4 rounded-lg bg-warm/[0.06] border border-warm/20 px-4 py-3">
                      <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-warm font-semibold mb-2">
                        Optional Add-Ons
                      </p>
                      {addOns.map((addon, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-1">
                          <span className="font-serif text-[12.5px] text-[#2C2C2C]/80">{addon.name}</span>
                          <span className="font-sans text-[11px] font-medium text-warm whitespace-nowrap">{addon.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between mt-3 pt-2">
                <button
                  onClick={() => toggleExpand(pkg.id)}
                  className="flex items-center gap-1 font-sans text-[10px] tracking-[0.15em] uppercase text-sage hover:text-grove transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>Hide Menu <ChevronUp size={12} /></>
                  ) : (
                    <>View Full Menu <ChevronDown size={12} /></>
                  )}
                </button>
                <button
                  onClick={() => toggleCompare(pkg.id)}
                  className={`flex items-center gap-1 font-sans text-[10px] tracking-[0.15em] uppercase transition-colors cursor-pointer ${
                    isComparing
                      ? 'text-warm'
                      : 'text-text-muted-brand hover:text-warm'
                  }`}
                >
                  {isComparing ? (
                    <><Check size={12} /> Comparing</>
                  ) : (
                    <>Compare</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Panel */}
      {comparePackages.length >= 2 && (
        <div className="rounded-[10px] border border-warm/30 bg-white p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage font-semibold">
              Package Comparison
            </h3>
            <button onClick={() => setCompareIds(new Set())} className="text-text-muted-brand hover:text-charcoal cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted-brand py-2 pr-4 w-[120px]">
                    Detail
                  </th>
                  {comparePackages.map(pkg => (
                    <th key={pkg.id} className="font-serif text-[13px] font-medium text-[#2C2C2C] py-2 px-3 min-w-[200px]">
                      {pkg.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-serif text-[12.5px] text-[#2C2C2C]/80">
                <tr className="border-b border-cream-dark/50">
                  <td className="font-sans text-[10px] tracking-[0.15em] uppercase text-text-muted-brand py-2 pr-4">Price</td>
                  {comparePackages.map(pkg => (
                    <td key={pkg.id} className="py-2 px-3 font-medium text-warm">{pkg.price}</td>
                  ))}
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="font-sans text-[10px] tracking-[0.15em] uppercase text-text-muted-brand py-2 pr-4">Season</td>
                  {comparePackages.map(pkg => {
                    const yr = !pkg.season || pkg.season.length === 0;
                    return (
                      <td key={pkg.id} className="py-2 px-3">
                        <div className="flex gap-1">
                          {yr ? <YearRoundBadge /> : pkg.season?.map(s => <SeasonBadge key={s} season={s} />)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="font-sans text-[10px] tracking-[0.15em] uppercase text-text-muted-brand py-2 pr-4">Menu</td>
                  {comparePackages.map(pkg => {
                    const { dishes } = parsePackageContent(pkg.description);
                    return (
                      <td key={pkg.id} className="py-2 px-3 align-top">
                        <ul className="space-y-0.5">
                          {dishes.map((d, i) => (
                            <li key={i} className="text-[11.5px] leading-[1.4]">• {d}</li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="font-sans text-[10px] tracking-[0.15em] uppercase text-text-muted-brand py-2 pr-4">Add-Ons</td>
                  {comparePackages.map(pkg => {
                    const { addOns } = parsePackageContent(pkg.description);
                    return (
                      <td key={pkg.id} className="py-2 px-3 align-top">
                        {addOns.length > 0 ? (
                          <ul className="space-y-0.5">
                            {addOns.map((a, i) => (
                              <li key={i} className="text-[11.5px] leading-[1.4]">
                                {a.name} <span className="text-warm font-medium">{a.price}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-text-muted-brand opacity-50">None</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
