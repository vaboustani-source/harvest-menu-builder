import { useState } from 'react';

export type DietFilter = 'all' | 'VG' | 'VE' | 'GF' | 'DF';
export type SeasonFilter = 'all' | 'year-round' | 'spring' | 'summer' | 'fall' | 'winter';

const DIET_OPTIONS: { id: DietFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'VG', label: 'Vegetarian' },
  { id: 'VE', label: 'Vegan' },
  { id: 'GF', label: 'GF' },
  { id: 'DF', label: 'Dairy-Free' },
];

const SEASON_OPTIONS: { id: SeasonFilter; label: string }[] = [
  { id: 'all', label: 'All Seasons' },
  { id: 'year-round', label: 'Year-Round' },
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
  { id: 'winter', label: 'Winter' },
];

interface Props {
  dietFilter: DietFilter;
  seasonFilter: SeasonFilter;
  onDietChange: (f: DietFilter) => void;
  onSeasonChange: (f: SeasonFilter) => void;
}

export function BuilderFilterBar({ dietFilter, seasonFilter, onDietChange, onSeasonChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-6">
      <span className="font-sans text-[10px] tracking-[0.2em] uppercase mr-1" style={{ color: '#8C8278' }}>
        Filter:
      </span>
      {DIET_OPTIONS.map(opt => (
        <button key={opt.id} onClick={() => onDietChange(opt.id)}
          className="flex items-center gap-[5px] px-[13px] py-[5px] rounded-full border font-sans text-[11px] transition-all duration-150 cursor-pointer"
          style={{
            background: dietFilter === opt.id ? '#2C3E2D' : '#FFFFFF',
            borderColor: dietFilter === opt.id ? '#2C3E2D' : '#D5CFC8',
            color: dietFilter === opt.id ? '#FFFFFF' : '#8C8278',
          }}>
          {opt.id !== 'all' && <span className="w-[6px] h-[6px] rounded-full bg-current opacity-70" />}
          {opt.label}
        </button>
      ))}

      <span className="w-px h-4 mx-1" style={{ background: '#D5CFC8' }} />

      <span className="font-sans text-[10px] tracking-[0.2em] uppercase mr-1" style={{ color: '#8C8278' }}>
        Season:
      </span>
      {SEASON_OPTIONS.map(opt => (
        <button key={opt.id} onClick={() => onSeasonChange(opt.id)}
          className="flex items-center gap-[5px] px-[13px] py-[5px] rounded-full border font-sans text-[11px] transition-all duration-150 cursor-pointer"
          style={{
            background: seasonFilter === opt.id ? '#C8A96E' : '#FFFFFF',
            borderColor: seasonFilter === opt.id ? '#C8A96E' : '#D5CFC8',
            color: seasonFilter === opt.id ? '#FFFFFF' : '#8C8278',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Check if an item matches current filters */
export function matchesFilters(
  diet: string[] | undefined,
  season: string[] | undefined,
  dietFilter: DietFilter,
  seasonFilter: SeasonFilter,
): boolean {
  // Diet match
  const dietMatch = dietFilter === 'all' || (diet?.includes(dietFilter) ?? false);
  // Season match
  const isYearRound = !season || season.length === 0;
  const seasonMatch =
    seasonFilter === 'all' ||
    (seasonFilter === 'year-round' ? isYearRound : (season?.includes(seasonFilter) ?? false));
  return dietMatch && seasonMatch;
}

// Shared badge components
export function DietBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    'VG': '#5a9456', 'VE': '#7a5a9e', 'GF': '#9E6B3C', 'DF': '#3C6B9E',
  };
  const c = colors[tag] || '#6B6B6B';
  return (
    <span className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
      style={{ color: c, borderColor: c }}>
      {tag}
    </span>
  );
}

const SEASON_COLORS: Record<string, string> = {
  'spring': '#7A9E7E', 'summer': '#C8A96E', 'fall': '#B87333', 'winter': '#5B7B9E',
};

export function SeasonBadge({ season }: { season: string }) {
  const label = season === 'spring' ? 'SPR' : season === 'summer' ? 'SUM' : season === 'fall' ? 'FAL' : season === 'winter' ? 'WIN' : season.toUpperCase();
  const c = SEASON_COLORS[season] || '#6B6B6B';
  return (
    <span className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
      style={{ color: c, borderColor: c }}>
      {label}
    </span>
  );
}

export function YearRoundBadge() {
  return (
    <span className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
      style={{ color: '#8C8278', borderColor: '#8C8278' }}>
      YEAR-ROUND
    </span>
  );
}

/** Render all badges for an item */
export function ItemBadges({ diet, season }: { diet?: string[]; season?: string[] }) {
  const hasDiet = diet && diet.length > 0;
  const hasSeason = season && season.length > 0;
  const isYearRound = !season || season.length === 0;
  
  if (!hasDiet && isYearRound) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        <YearRoundBadge />
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {hasDiet && diet.map(d => <DietBadge key={d} tag={d} />)}
      {hasSeason ? season.map(s => <SeasonBadge key={s} season={s} />) : <YearRoundBadge />}
    </div>
  );
}
