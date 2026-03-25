import type { DietTag as DietTagType } from '@/data/menuData';

const TAG_CONFIG: Record<DietTagType, { label: string; color: string }> = {
  veg:   { label: 'VG',  color: '#5a9456' },
  vegan: { label: 'Ve',  color: '#7a5a9e' },
  gf:    { label: 'GF',  color: '#9E6B3C' },
  df:    { label: 'DF',  color: '#3C6B9E' },
};

export function DietTagBadge({ tag }: { tag: DietTagType }) {
  const cfg = TAG_CONFIG[tag];
  return (
    <span
      style={{ color: cfg.color, borderColor: cfg.color }}
      className="inline-block border rounded-sm px-[6px] py-[2px] text-[9px] font-sans font-medium tracking-widest uppercase leading-none"
    >
      {cfg.label}
    </span>
  );
}

export const DIET_FILTER_OPTIONS = [
  { id: 'all',   label: 'All' },
  { id: 'veg',   label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gf',    label: 'GF' },
  { id: 'df',    label: 'Dairy-Free' },
] as const;
