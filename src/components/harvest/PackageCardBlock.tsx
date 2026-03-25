import type { PackageCard } from '@/data/menuData';

export function PackageCardBlock({ card }: { card: PackageCard }) {
  return (
    <div className="bg-grove rounded-[10px] px-8 py-7 flex justify-between items-center gap-5 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <p className="font-serif text-[11px] font-medium tracking-[0.25em] uppercase text-sage-light opacity-70 mb-1 not-italic">
          {card.title}
        </p>
        <p className="font-serif text-[16px] italic text-cream/80 leading-[1.7]">
          {card.description}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-serif text-[38px] font-light text-warm leading-none">{card.price}</p>
      </div>
    </div>
  );
}
