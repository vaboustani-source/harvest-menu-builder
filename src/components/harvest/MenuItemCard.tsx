import type { MenuItem } from '@/data/menuData';
import { DietTagBadge } from './DietTag';

interface Props {
  item: MenuItem;
  hidden?: boolean;
}

export function MenuItemCard({ item, hidden }: Props) {
  if (hidden) return null;

  return (
    <div className="relative bg-white rounded-[10px] border border-cream-dark px-[22px] py-[20px] overflow-hidden transition-all duration-200 hover:shadow-card hover:-translate-y-px hover:border-sage-light group">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-sage-light transition-colors duration-200 group-hover:bg-sage" />

      <p className="font-serif text-[14.5px] text-charcoal leading-[1.5] mb-[6px]">
        {item.name}
      </p>

      {item.description && (
        <p className="font-serif text-[12.5px] italic text-text-muted-brand leading-[1.55] mb-2">
          {item.description}
        </p>
      )}

      {item.note && (
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-text-muted-brand opacity-60 mb-2">
          {item.note}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
        <div className="flex gap-[5px] flex-wrap">
          {item.diet?.map((tag) => (
            <DietTagBadge key={tag} tag={tag} />
          ))}
        </div>
        {item.price && (
          <span className="font-sans text-[11px] font-medium text-warm whitespace-nowrap">
            {item.price}
          </span>
        )}
      </div>
    </div>
  );
}
