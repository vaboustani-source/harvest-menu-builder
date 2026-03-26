import { Diamond, Plus } from 'lucide-react';
import { useBasicsCards, type BulletItem } from '@/hooks/useBasicsCards';

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
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-cream-dark" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.cards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg p-7 shadow-card">
                  <h4 className="font-serif text-[20px] font-light text-grove mb-4 leading-[1.3]">
                    {card.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {card.bullets.map((b, i) => (
                      <BulletLine key={i} item={b} type={card.card_type} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
