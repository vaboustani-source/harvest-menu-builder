import { Diamond, Plus } from 'lucide-react';
import { useBasicsCards, type BulletItem } from '@/hooks/useBasicsCards';

const sectionIntros: Record<string, string> = {
  'Cocktail Hour': 'One hour. Four selections. Every bite passed by Gilbertsville staff while your guests settle into the weekend.',
  'Reception Dinner (Family Style)': 'This is the main event — courses hit the table family-style, meant to be shared. You choose the menu. We handle the rhythm, the pacing, and every plate.',
  'Bar Service (All Events)': 'Full bar, all weekend, every event. Premium liquor, craft beer, Hudson Valley wines — poured by our staff from open to last call.',
  'After-Party & Welcome Party': 'The bookend events that set the tone. Late-night bites after the reception. A welcome spread the night before. Both built to feel effortless.',
  'Breakfast, Brunch & Lunch Events': 'Morning-after brunch is non-negotiable. Whether it\'s a full plated affair or a relaxed buffet, we build it fresh — same kitchen, same standards.',
};

function BulletLine({ item, type }: { item: BulletItem; type: 'included' | 'addon' }) {
  return (
    <li className="flex items-start gap-2.5 py-[5px]">
      {type === 'included' ? (
        <Diamond size={10} className="text-sage mt-[5px] shrink-0 fill-sage" />
      ) : (
        <Plus size={12} className="text-warm mt-[4px] shrink-0" strokeWidth={2.5} />
      )}
      <span className="font-serif text-[15px] italic text-text-muted-brand leading-[1.6]">
        {item.text}
        {item.price && (
          <span className="not-italic font-semibold text-text-brand"> — {item.price}</span>
        )}
      </span>
    </li>
  );
}

export function BasicsContent() {
  const { data: groups, isLoading } = useBasicsCards();

  if (isLoading) {
    return <p className="font-sans text-xs text-muted-foreground animate-pulse">Loading…</p>;
  }

  return (
    <div>
      {/* Intro block */}
      <div className="mb-10">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[10px]">
          How It All Works
        </p>
        <h2
          className="font-serif font-light text-grove leading-[1.15] mb-3"
          style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          What's Included in Every Event
        </h2>
        <p className="font-serif text-[15px] italic text-text-muted-brand max-w-[640px] leading-[1.75]">
          Every food &amp; beverage event at Gilbertsville Farmhouse is built from the same
          foundation — fresh, scratch-made food, attentive service, and beautiful presentation.
          Here's what's always included, by event type.
        </p>
        <div className="w-[60px] h-px bg-sage-light mt-5 mb-9" />
      </div>

      {/* Card groups */}
      <div className="space-y-10">
        {groups?.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-sans text-[12px] tracking-[0.38em] uppercase text-sage">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-cream-dark" />
            </div>
            {sectionIntros[group.label] && (
              <p className="font-serif text-[14px] italic text-text-muted-brand max-w-[600px] leading-[1.7] mb-5">
                {sectionIntros[group.label]}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.cards.map((card) => {
                const isFullWidth = group.cards.length > 2 && card.card_type === 'addon';
                return (
                <div key={card.id} className={`bg-white rounded-lg p-7 shadow-card ${isFullWidth ? 'md:col-span-2' : ''}`}>
                  <h4 className="font-serif text-[20px] font-light text-grove mb-4 leading-[1.3]">
                    {card.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {card.bullets.map((b, i) => (
                      <BulletLine key={i} item={b} type={card.card_type} />
                    ))}
                  </ul>
                  {card.title.toLowerCase().includes('rehearsal') && card.group_label === 'Bar Service (All Events)' && (
                    <p className="font-serif text-[13px] italic text-text-muted-brand/60 mt-4 leading-[1.6]">
                      Full bar package details available in your planning portal.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}