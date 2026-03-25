import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AccordionGroup } from '@/data/menuData';

export function AccordionBlock({ groups }: { groups: AccordionGroup[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border border-cream-dark rounded-[10px] overflow-hidden">
      {groups.map((group, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-cream-dark last:border-b-0">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full flex justify-between items-center px-6 py-5 text-left transition-colors duration-150 ${
                isOpen ? 'bg-cream' : 'bg-white hover:bg-cream'
              }`}
            >
              <div className="flex items-center gap-4">
                {group.emoji && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 transition-colors duration-150 ${
                      isOpen ? 'bg-sage-light' : 'bg-cream-dark'
                    }`}
                  >
                    {group.emoji}
                  </div>
                )}
                <div>
                  <p className="font-serif text-[19px] font-normal text-grove">{group.title}</p>
                  {group.subtitle && (
                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-text-muted-brand mt-[2px]">
                      {group.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {group.price && (
                  <span className="font-sans text-[12px] font-medium text-sage tracking-[0.04em]">
                    {group.price}
                  </span>
                )}
                <ChevronDown
                  size={20}
                  className={`text-text-muted-brand transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 bg-cream animate-fade-in">
                <p className="font-serif text-[14px] italic text-[#555] leading-[1.75] pt-4">
                  {group.body}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
